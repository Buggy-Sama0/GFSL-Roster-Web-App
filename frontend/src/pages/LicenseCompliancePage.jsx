import React, { useState, useEffect, useMemo, useContext } from 'react';
import Header from '../components/Header';
import { LicenseExpiryContext } from '../context/LicenseExpiryContext';
import { useLicenseStatus } from '../hooks/useLicenseStatus';
import { SiteContext } from '../context/SiteContext';

export default function LicenseCompliancePage({children}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [status, setStatus] = useState();
  const [selectedRecord, setSelectedRecord] = useState(null);

  const {currentLicenseExpiry, setCurrentLicenseExpiry} = useContext(LicenseExpiryContext);
  const {currentSite, setCurrentSite} = useContext(SiteContext);

  // Using custom hook to get guard expiry status and urgent guards
  const { guardStatus, urgentGuards, _ } = useLicenseStatus();
  // console.log('LicenseCompliancePage: guardStatus:', guardStatus.slice(4));
  // console.log('LicenseCompliancePage: urgentGuards:', urgentGuards);

  // Pagination state variables
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    setCurrentLicenseExpiry(urgentGuards);
  }, [urgentGuards, setCurrentLicenseExpiry]);

  useEffect(() => {
    setCurrentPage(0);
  }, [guardStatus]);

  // const filteredGuards =  guardStatus.filter((guard) => {
  //   // if (guard.)
  //     // Filter guards based on search name and id
  //   const matchesSearch = guard.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
  //                         guard.hkid.toLowerCase().includes(searchTerm.toLowerCase());
  //     // Filter guards based on selected status filter
  //   const matchesFilter = selectedFilter === 'All' || guard.status === selectedFilter;
  //   return matchesSearch && matchesFilter;
  // });
  // Combined Filtering Logic (Search + Status + Site)
  const filteredGuards = useMemo(() => {
    return guardStatus.filter((guard) => {
      // Search filter
      const matchesSearch =
        guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guard.hkid.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesFilter =
        selectedFilter === 'All' || guard.status === selectedFilter;

      // 3. Site filter (if guard object contains site_id)
      // const matchesSite =
      //   !currentSite || currentSite === 'ALL' || guard.site_id === Number(currentSite);

      return matchesSearch && matchesFilter 
      // && matchesSite;
    });
  }, [guardStatus, searchTerm, selectedFilter])

  // Stats calculation
  const totalGuards = filteredGuards.length;
  const validCount = filteredGuards.filter(g => g.status === 'Valid').length;
  const expiredCount = filteredGuards.filter(g => g.status === 'Expired').length;
  const urgentCount = filteredGuards.filter(g => g.status === 'Expiring Soon').length;

  const numOfPages = Math.ceil(filteredGuards.length / itemsPerPage) || 1;
  const paginatedGuards = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredGuards.slice(start, start + itemsPerPage);
  }, [filteredGuards, currentPage, itemsPerPage]);

  // Action Simulator: Handle an updated document upload manually
  // const simulateRenewal = (id) => {
  //   setData(prev => prev.map(guard => {
  //     if (guard.id === id) {
  //       return {
  //         ...guard,
  //         expiryDate: '2027-12-31', // Renew to next year
  //         status: 'Compliant'
  //       };
  //     }
  //     return guard;
  //   }));
  // };

  // async function handleSendEmail() {
  //   if (!urgentGuards || urgentGuards.length === 0) {
  //     console.log('No urgent guards to send email for.');
  //     return;
  //   }
  //   const response = await fetch(`${API_BASE_URL}/send-email`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       expiring_licences: urgentGuards,
  //       to_address: 'limbuc489@gmail.com',
  //       subject: 'Urgent License Renewal Reminder'
  //     })
  //   });

  //   if (!response.ok) {
  //     console.error('Failed to send email:', response);
  //   }
  //   console.log(response);
  // }

  // useEffect(() => {
  //   handleSendEmail();
  // }, [urgentGuards]); 

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
      {/* <Header message={currentLicenseExpiry} /> */}
      
      <main className="flex-1 p-8 overflow-auto space-y-6">
  
        {/* Row 1: Header Titles */}
        <div>
          <h1 className="text-2xl font-black text-emerald-600 tracking-tight">Compliance & Licensing Register</h1>
          <p className="text-sm text-slate-500">Verify, audit, and renew critical active credentials before scheduling.</p>
        </div>

        {/* Row 2: Live KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Tracked Staff</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalGuards}</h3>
            </div>
            <span className="text-3xl bg-blue-50 p-3 rounded-xl">👮🏼‍♂️</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Expired Licences</p>
              <h3 className="text-3xl font-black text-red-600 mt-1">{expiredCount}</h3>
            </div>
            <span className="text-3xl bg-red-50 p-3 rounded-xl">⚠️</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Expiring within (&lt;30 Days)</p>
              <h3 className="text-3xl font-black text-amber-500 mt-1">{urgentCount}</h3>
            </div>
            <span className="text-3xl bg-amber-50 p-3 rounded-xl">🕒</span>
          </div>
        </div>

        {/* Row 3: Live Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Search Bar Input */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search guard or hkid No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Horizontal Segmented Control Pills */}
            <div className="bg-slate-50 p-1 rounded-lg border border-slate-200/60 flex gap-0.5">
              {['All', 'Valid', 'Expiring Soon', 'Expired'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-md transition duration-150 ${
                    selectedFilter === filter
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter == 'Expiring Soon' 
                  ? `Expiring Soon (${urgentCount})` 
                  : filter == 'Expired' 
                  ? `Expired (${expiredCount})` 
                  : filter == 'Valid' 
                  ? `Valid (${validCount})` 
                  : filter}
                </button>
              ))}
            </div>

          
        </div>

        {/* Row 4: Grid Data Register */}
        <div className="bg-[#1a2b3a] rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a2b3a] border-b border-slate-200 text-[13px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="p-4 pl-6">Empoyee</th>
                <th className="p-4">HKID</th>
                <th className="p-4">CWR Card No</th>
                <th className="p-4">CWR Expiry Date</th>
                <th className="p-4">Green Card Expiry Date</th>
                <th className="p-4">SPP Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedGuards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 text-xs">
                    No matching compliance records found.
                  </td>
                </tr>
              ) : (
                paginatedGuards.map((guard) => (
                  <tr key={guard.id} className="hover:bg-slate-50/50 transition text-xs">
                    
                    {/* Guard Name Info Block */}
                    <td className="p-4 pl-6">
                      <div>
                        <p className="font-semibold text-white text-sm">{guard.name}</p>
                        <p className="text-[12px] text-slate-500">{guard.role}</p>
                      </div>
                    </td>

                    {/* HKID Details */}
                    <td className="p-4 text-emerald-600 font-semibold text-sm">{guard.hkid}</td>

                    {/* CWR CARD Details */}
                    <td className="p-4 text-emerald-600 font-semibold text-sm">{guard.cwr_card_no}</td>
                    
                    {/* CWR Expiry Date */}
                    <td className="p-4 text-emerald-600 font-semibold text-sm">{guard.cwr_expiry_date}</td>

                    {/* Green Card Expiry Date */}
                    <td className="p-4 text-emerald-600 font-semibold text-sm">{guard.green_card_expiry_date}</td>

                    {/* SPP Expiry Date */}
                    <td className="p-4 text-emerald-600 font-semibold text-sm">{guard.spp_expiry_date}</td>

                    {/* Dynamic Status Badges */}
                    <td className="p-4">
                      {guard.status === 'Expiring Soon' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">
                          🟡 Expires Soon
                        </span>
                      )}
                      {guard.status === 'Expired' && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 font-bold px-2 py-0.5 rounded text-[10px]">
                          🔴 Expired
                        </span>
                      )}
                      {guard.status === 'Valid' && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded text-[10px]">
                          🟢 Valid
                        </span>
                      )}
                    </td>

                    {/* Interactive Action Links */}
                    <td className="p-4 pr-6 text-right font-medium">
                      <div className="flex items-center justify-end gap-2 text-[11px]">
                        {/* Trigger state on click */}
                        <button 
                          onClick={() => setSelectedRecord(guard)} 
                          className="text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          View
                        </button>
                        {guard.status !== 'Valid' && (
                          <>
                            <span className="text-slate-200 select-none">•</span>
                            <button className="text-orange-500 hover:text-orange-700 hover:underline">Renew</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>

        {/* Pagination Bar */}
        {numOfPages > 1 && (
          <div className="flex justify-end gap-1 pt-2">
            {Array.from({length: numOfPages}).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  currentPage === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >         
              {idx + 1}
              </button>
            ))}
          </div>
        )}
      </main>
      {/* Render the detail drawer if a row is selected */}
      {selectedRecord && (
        <DetailDrawer 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
}

function DetailDrawer({ record, onClose }) {
  const initials = record.name ? record.name.split(' ').map(n => n[0]).join('') : '??';

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Injecting smooth CSS keyframes directly so it works out-of-the-box */}
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-drawer-slide {
          animation: drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-backdrop-fade {
          animation: backdropFadeIn 0.2s ease-out forwards;
        }
      `}</style>

      {/* Backdrop (Fades in) */}
      <div 
        className="flex-1 bg-slate-900/40 backdrop-blur-sm cursor-pointer animate-backdrop-fade" 
        onClick={onClose} 
      />
      
      {/* Panel (Slides in from the right) */}
      <div className="w-96 bg-white h-full flex flex-col shadow-2xl z-10 animate-drawer-slide">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold bg-blue-600 flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-800">{record.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{record.role} · {record.site}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status banner */}
          <div className={`rounded-xl border px-4 py-3 ${
            record.status === 'Expired' 
              ? 'bg-red-50 border-red-100' 
              : record.status === 'Expiring Soon' 
              ? 'bg-amber-50 border-amber-100' 
              : 'bg-emerald-50 border-emerald-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] tracking-tight border ${
                record.status === 'Expired' 
                  ? 'bg-red-100/50 text-red-600 border-red-200/40' 
                  : record.status === 'Expiring Soon'
                  ? 'bg-amber-100/50 text-amber-700 border-amber-200/40'
                  : 'bg-emerald-100/50 text-emerald-600 border-emerald-200/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  record.status === 'Expired' ? 'bg-red-500' : record.status === 'Expiring Soon' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                {record.status}
              </span>

              <span className={`text-[11px] font-mono font-bold ${
                record.status === 'Expired' ? 'text-red-600' : record.status === 'Expiring Soon' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {record.status === 'Expired' ? '⚠ Action Required' : record.status === 'Expiring Soon' ? '⏰ Renew Soon' : '✓ Compliant'}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">License Details</p>
            {[
              { label: 'CWR Card No.',         value: record.cwr_card_no, mono: true },
              { label: 'CWR Expiry Date',      value: record.cwr_expiry_date, mono: true },
              { label: 'Green Card Expiry Date',    value: record.green_card_expiry_date, mono: true },
              { label: 'SPP Expiry Date',      value: record.spp_expiry_date, mono: true },
            ].map(f => (
              <div key={f.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-50">
                <span className="text-[11px] text-slate-400">{f.label}</span>
                <span className={`text-[12px] font-semibold text-slate-700 text-right ${f.mono ? 'font-mono' : ''}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {/* Validity Timeline Bar */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Validity Timeline</p>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    record.status === 'Expired' ? 'bg-red-400' : record.status === 'Expiring Soon' ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: record.status === 'Expired' ? '100%' : `${Math.min((record.daysLeft / 730) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-bold font-mono shrink-0">
                {record.status === 'Expired' ? 'Expired' : `${record.daysLeft}d left`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-2">
          <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
            {record.status === 'Expired' ? 'Re-scan & Renew' : 'Update Document'}
          </button>
          <button className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-semibold transition-colors">
            Send Renewal Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

