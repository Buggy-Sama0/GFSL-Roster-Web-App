import React, { useState, useEffect, useMemo, useContext } from 'react';
import Header from '../components/Header';
import ScanConfirmationModal from '../components/ScanConfirmationModal';
import DetailDrawer from '../components/DetailDrawer'
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
  // console.log('LicenseCompliancePage: guardStatus:', guardStatus);
  // console.log('LicenseCompliancePage: urgentGuards:', urgentGuards);

  // Pagination state variables
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
  // const API_BASE_URL = 'http://localhost:8000'

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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Expiring within 60 Days</p>
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
        <div className="bg-[#1a2b3a] rounded-xl shadow-sm border border-slate-700/60 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#1a2b3a] border-b border-slate-700/60 text-[13px] font-bold tracking-wider text-slate-400 uppercase">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">HKID</th>
                <th className="p-4">CWR Card No</th>
                <th className="p-4">CWR Expiry Date</th>
                <th className="p-4 ">Green Card Expiry Date</th>
                <th className="p-4">SPP Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {paginatedGuards.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 text-xs">
                    No matching compliance records found.
                  </td>
                </tr>
              ) : (
                paginatedGuards.map((guard) => (
                  <tr key={guard.id} className="hover:bg-slate-800/60 transition text-xs">
                    
                    {/* Guard Name Info Block */}
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-white text-sm">{guard.name}</p>
                        <p className="text-[12px] text-slate-400">{guard.role}</p>
                      </div>
                    </td>

                    {/* HKID Details */}
                    <td className="p-4 text-emerald-400 font-semibold text-sm whitespace-nowrap">{guard.hkid}</td>

                    {/* CWR CARD Details */}
                    <td className="p-4 text-emerald-400 font-semibold text-sm whitespace-nowrap">{guard.cwr_card_no}</td>
                    
                    {/* CWR Expiry Date */}
                    <td className={`p-4 ${guard.expiredLicenses.includes('cwr_expiry_date') ? 'text-red-400' : guard.expiringLicenses.includes('cwr_expiry_date') ? 'text-amber-400' : 'text-emerald-400'} font-semibold text-sm whitespace-nowrap`}>
                      {guard.cwr_expiry_date}
                    </td>

                    {/* Green Card Expiry Date */}
                    <td className={`p-4 ${guard.expiredLicenses.includes('green_card_expiry_date') ? 'text-red-400' : guard.expiringLicenses.includes('green_card_expiry_date') ? 'text-amber-400' : 'text-emerald-400'} font-semibold text-sm whitespace-nowrap`}>
                      {guard.green_card_expiry_date}
                    </td>

                    {/* SPP Expiry Date */}
                    <td className={`p-4 ${guard.expiredLicenses.includes('spp_expiry_date') ? 'text-red-400' : guard.expiringLicenses.includes('spp_expiry_date') ? 'text-amber-400' : 'text-emerald-400'} font-semibold text-sm whitespace-nowrap`}>
                      {guard.spp_expiry_date}
                    </td>

                    {/* Dynamic Status Badges */}
                    <td className="p-4 whitespace-nowrap">
                      {guard.status === 'Expiring Soon' && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">
                          🟡 Expires Soon
                        </span>
                      )}
                      {guard.status === 'Expired' && (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-2 py-0.5 rounded text-[10px]">
                          🔴 Expired
                        </span>
                      )}
                      {guard.status === 'Valid' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded text-[10px]">
                          🟢 Valid
                        </span>
                      )}
                    </td>

                    {/* Interactive Action Links */}
                    <td className="p-4 pr-6 text-right font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 text-[11px]">
                        <button 
                          onClick={() => setSelectedRecord(guard)} 
                          className="text-blue-400 hover:text-blue-300 hover:underline text-[13px]"
                        >
                          View
                        </button>
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

