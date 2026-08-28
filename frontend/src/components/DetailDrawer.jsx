import { useState, useEffect, useMemo, useContext } from 'react';
import ScanConfirmationModal from '../components/ScanConfirmationModal';
import supabase from '../services/supabase/client';

export default function DetailDrawer({ record, onClose }) {
  const initials = record.name ? record.name.split(' ').map(n => n[0]).join('') : '??';
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Modal and save states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    // const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
    const API_BASE_URL = 'http://localhost:8000'
    setIsScanning(true)
    try {
      const response = await fetch(`${API_BASE_URL}/extract-data`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fdata = await response.json();
      console.log('File Data Extracted:', fdata);  
      setScanResult(fdata);
      setIsModalOpen(true)    
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsScanning(false)
    }

  }

  // Database Update Handler (triggered by modal "Confirm & Update" button)
  const handleConfirmScan = async (verifiedData) => {
    console.log(record.id)
    setIsSaving(true);
    const COLUMN_MAP = {
        CWR: 'cwr_expiry_date',
        GREEN_CARD: 'green_card_expiry_date',
        SPP: 'spp_expiry_date',
    };

    const columnName = COLUMN_MAP[verifiedData.card_type];

    try {
      // Supabase update logic
      const { data, error } = await supabase
        .from('employees')
        .update({
            [columnName] : verifiedData.expiry_date
        })
        .eq('id', record.id)
        .select();

      if (error) throw error
      console.log('Successfully updated record:', data);
      // Close modal and reset uploaded file state
      setIsModalOpen(false);
      setFile(null);
    } catch (error) {
      console.error('Save Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="px-6 py-4 border-t border-slate-100 space-y-2.5">
        {/* Conditional File Preview or Upload Label */}
        {file ? (
          <div className="relative overflow-hidden flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 transition-all">
            {/* Shimmer / Laser Scan Bar Effect when Loading */}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            )}

            <div className="flex items-center gap-2.5 min-w-0 z-10">
              {/* Dynamic Status Icon */}
              <div className={`p-2 rounded-lg text-white flex-shrink-0 transition-all ${
                isScanning ? 'bg-blue-500 shadow-md shadow-blue-500/30' : 'bg-blue-600'
              }`}>
                {isScanning ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
              </div>

              {/* File Info / Status Text */}
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-slate-800 truncate leading-snug">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isScanning ? (
                    <span className="text-blue-600 font-medium animate-pulse flex items-center gap-1">
                      AI extracting date...
                    </span>
                  ) : (
                    `${(file.size / 1024).toFixed(1)} KB`
                  )}
                </p>
              </div>
            </div>

            {/* Remove File Button (Hidden during scan) */}
            {!isScanning && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
                title="Remove file"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.xlsx,.csv,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            Upload Document
          </label>
        )}

        {/* Main Action / Scan Button with Loading State */}
        <button
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          onClick={handleSubmit}
          disabled={!file || isScanning}
        >
          {isScanning ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Processing Document...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <rect x="7" y="7" width="10" height="10" rx="1"/>
              </svg>
              {record.status === 'Expired' ? 'Re-scan & Renew' : 'Update Document'}
            </>
          )}
        </button>

        {/* Confirmation Modal Component */}
        <ScanConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmScan}
          extractedData={scanResult}
          isSaving={isSaving}
        />

        {/* Secondary Reminder Action Button */}
        <button
          disabled={isScanning}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8z" />
            <polyline points="22,9 12,15 2,9" />
          </svg>
          Send Renewal Reminder
        </button>
      </div>
      </div>
    </div>
  );
}