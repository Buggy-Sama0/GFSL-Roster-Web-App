import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { SiteContext } from '../context/SiteContext';
import supabase from '../services/supabase/client';

// 1. Correctly destructure props here
export default function Header({ message, next, previous, currentWeekMonday }) {
  const { currentSite, setCurrentSite } = useContext(SiteContext);
  const [sites, setSites] = useState([]);

  // console.log('Header message:', message);
  // const messageText = Object.values(message)[0]?.length >= 1 ? `${Object.values(message)[0].length} license expiring soon`: null;
  // console.log('Header Site_Text:', site);

  // Safely extract the message length from the object prop
  // const listLength = message && Object.values(message)[0]?.length;
  // const messageText = listLength >= 1 ? `${listLength} license expiring soon` : null;

  // Using optional chaining (?.) prevents "cannot read property of undefined" errors
  const valuesArray = message ? Object.values(message).length : [];
  // console.log('Header: valuesArray:', valuesArray);
  // const listLength = valuesArray[0]?.length || 0; 
  const messageText = valuesArray >= 1 ? `${valuesArray} license expiring soon` : null;

  // Generate a dynamic dynamic week range subtitle (Optional but highly recommended)
  const getWeekRangeString = () => {
    if (!currentWeekMonday) return "(Oct 21 - Oct 27)"; // Fallback if not provided yet
    
    const start = new Date(currentWeekMonday);
    const end = new Date(currentWeekMonday);
    end.setDate(start.getDate() + 6);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `(${startStr} - ${endStr})`;
  };

  // fetching sites from supabase database and setting them in state
  useEffect(() => {
    async function fetchSites() {
      try {
        const { data, error } = await supabase.from('sites').select('*');
        if (error) throw error;
        // console.log('Fetched sites data:', data);
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites data:', error);
      }
    }
    fetchSites();
  }, [])


  return (
  <header className="bg-[#1a2b3a] border-b border-slate-800 px-8 py-5 shrink-0 flex flex-col gap-4 text-slate-100">
    <div className="flex justify-between items-center flex-wrap gap-4">
      
      {/* Left: Title and Dynamic Dates */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase">
            Operational Roster {currentSite ? `- ${currentSite}` : ''}
          </h1>
          
        </div>
        <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-2">
          <span>📅 {getWeekRangeString()}</span>
        </p>
      </div>

      {/* Middle: Warning Banner */}
      {messageText && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-2 font-medium">
          <span>⚠️</span> {messageText}
        </div>
      )}

      {/* Right: Controls (Site Selector, Date Nav, CTA) */}
      <div className="flex items-center gap-3">
        {/* Site Selector Dropdown */}
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
            Site Selector
          </label>
          <select
            value={currentSite || ''}
            className="border border-slate-700 rounded-lg px-3 py-1.5 text-xs bg-[#1a1f2c] text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            onChange={(e) => setCurrentSite(e.target.value)}
          >
            <option value="" disabled>Select a site</option>
            {sites.length > 0 ? (
              sites.map((site) => (
                <option key={site.id} value={site.company_name} className="bg-[#1a1f2c]">
                  {site.company_name} - {site.id}
                </option>
              ))
            ) : (
              <option value="" disabled className="bg-[#1a1f2c]">Loading sites...</option>
            )}
          </select>
        </div>

        {/* Date Navigation Controls */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
            Week Navigation
          </span>
          <div className="inline-flex rounded-lg border border-slate-700 bg-[#1a1f2c] p-0.5">
            <button 
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition"
              onClick={previous}
              title="Previous Week"
            >
              ◀
            </button>
            <span className="border-r border-slate-700 my-1"></span>
            <button 
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition"
              onClick={next}
              title="Next Week"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 self-end mt-4">
            <span>+</span> Add Shift
          </button>
        </div>
      </div>

    </div>
  </header>
);
}