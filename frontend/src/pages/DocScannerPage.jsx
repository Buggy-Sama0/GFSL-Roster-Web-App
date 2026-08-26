import React from 'react';
import { useState, useEffect } from 'react';
import VideoSection from '../components/VideoSection.jsx';

export default function DocScannerPage() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState(() => {
    return sessionStorage.getItem('doc_scanner_text') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    sessionStorage.setItem('doc_scanner_text', textInput);
  }, [textInput]);

  const handleSubmit = async () => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (textInput.trim()) formData.append('raw_text', textInput);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
    // const API_BASE_URL = 'http://localhost:8000'

    try {
      if (!import.meta.env.VITE_BACKEND_API_URL) {
        console.warn('VITE_BACKEND_API_URL is not set. Please check your .env file.');
      }
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // console.log('Form submitted successfully', response);
      let filename = response.headers.get('Content-Disposition');
      const blob = await response.blob();
      // console.log('Received blob:', blob.text().then(text => console.log('Blob text:', text)));
      let result = await blob.text();
      let array_items = Array.from(result.split('\n')).map(line => line.split(','));
      let index = array_items.indexOf(' ')
      array_items.splice(index, 1);
      const url = URL.createObjectURL(blob);
      setDownloadResult({ 'filename': filename, 'url': url });
      setPreviewData(array_items);
      clearDraft()
      // Testing use case
      // const previewUrl = URL.createObjectURL(file);
      // imgElement = document.getElementById('preview-image');
      // imgElement.src = previewUrl; 
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      // sessionStorage.setItem('doc_scanner_text', '');
      setTextInput('')
      setIsSubmitting(false);
    }
  }

  // useEffect(() => {
  //   if (previewData.length > 0) {
  //     console.log('Preview Data:', typeof previewData, previewData);
  //   }
  // }, [previewData]);

  return (
    <div className="flex-1 flex flex-col h-full p-6 bg-[#0a0e17] overflow-hidden">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-300">AI Document & Roster Assistant</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload guard records containing fields like name, hkid, cwr_card_no, cwr_expiry_date, green_card_expiry_date, spp_expiry_date.
        </p>
      </div>

      {/* Chat Message Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {/* System Welcome Message Bubble */}
        {/* <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            AI
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-2xl text-slate-700 text-sm shadow-sm space-y-2">
            <p className="font-semibold text-slate-900">Ready to scan documents</p>
            <p>
              Click the <strong className="text-blue-600">+</strong> button below to attach employee records, or paste raw text directly into the chat box.
            </p>
          </div>
        </div> */}

        {/* <InputExampleDemo /> */}
        <VideoSection />
        <img id="preview-image" className="max-h-32 mb-2 rounded-lg border border-slate-200" />

        {/* LOADING UI STATE IN CHAT THREAD */}
        {isSubmitting && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm w-full max-w-md">
              {/* Header */}
              {/* <div className="flex items-center gap-2 mb-4">
                <svg className="animate-spin h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Processing Document</span>
              </div> */}

              {/* Animated Flow: Text → CSV */}
              <div className="relative w-full h-28 flex items-center justify-center">
                {/* Left Node - Text */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
                  <div className="w-11 h-11 rounded-full bg-slate-50 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.25)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Text</span>
                </div>

            {/* Center Hub - AI Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative flex items-center justify-center">
                {/* Outer Glowing Blur Aura */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-100 to-cyan-200 opacity-20 blur-md animate-pulse"></div>

                {/* Main Badge Body with Gradient Border */}
                <div className="relative w-11 h-11 rounded-full p-[1px] bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent font-black text-[12px] tracking-wider select-none">
                      AI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Node - CSV */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
              <div className="w-11 h-11 rounded-full bg-slate-50 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.25)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 13h2M8 17h2" strokeWidth="1.5" />
                  <path d="M12 13h2M12 17h2" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">CSV</span>
            </div>

            {/* SVG Animated Lines */}
            <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 600 112" fill="none" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="grad-right" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Left to Center (Extended X: 40 -> 300) */}
              <path d="M 40 56 Q 170 20 300 56" stroke="url(#grad-left)" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite" />
              </path>

              {/* Center to Right (Extended X: 300 -> 560) */}
              <path d="M 300 56 Q 430 20 560 56" stroke="url(#grad-right)" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="24" dur="1.5s" repeatCount="indefinite" />
              </path>

              {/* Flowing dots (Updated paths to match extended coordinates) */}
              <circle r="2.5" fill="#3b82f6" opacity="0.9">
                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 40 56 Q 170 20 300 56" />
              </circle>
              <circle r="2.5" fill="#f59e0b" opacity="0.9">
                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 300 56 Q 430 20 560 56" />
              </circle>
            </svg>
          </div>
        </div>
        <style jsx>{`
          @keyframes pulse-hub {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35); }
            50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          }
        `}</style>
      </div>
    )}

        {/* Dynamic AI Response Card showing Filename, Preview & Download Link */}
        {downloadResult && !isSubmitting && (
          <div className="flex gap-3 items-start w-full">
            {/* AI Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>

            {/* Expanded Response Card Container */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 w-full max-w-3xl text-slate-700 text-sm shadow-sm">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="font-bold text-slate-800">Processing Complete</span>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">Ready</span>
              </div>

              {/* File Info Bar */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                <span className="text-2xl">📄</span>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Generated File</p>
                  <p className="text-xs font-medium text-slate-800 truncate">{downloadResult.filename}</p>
                </div>
              </div>

            {/* ================= PREVIEW TABLE SECTION ================= */}
            {previewData.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Data Preview ({previewData.length - 1} rows)
                  </span>
                </div>

                {/* Scrollable Table Container */}
                <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-slate-50/50">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] sticky top-0 border-b border-slate-200">
                      <tr>
                        {Object.keys(previewData[0]).map((header) => (
                          <th key={header} className="px-3 py-2 font-semibold whitespace-nowrap">
                            {header.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 bg-white">
                      {previewData.map((row, index) => (
                        <tr key={index} className="hover:bg-blue-50/40 transition">
                          {Object.values(row).map((value, cellIdx) => (
                            <td key={cellIdx} className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Download Action Button */}
            <a
              href={downloadResult.url}
              download={downloadResult.filename}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition text-center shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download {downloadResult.filename}
            </a>
          </div>
        </div>
      )}
      </div>

      {/* Bottom Chat Input Box Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-md">
        {file && (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 mb-2 w-fit">
            <span>📄 {file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-1"
            >
              ×
            </button>
          </div>
        )}
        

        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <label className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer transition flex items-center justify-center shrink-0">
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </label>

          {/* Text Area Input */}
          <textarea
            rows={1}
            placeholder="Paste raw text or upload a document..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none px-2 py-1"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (!file && !textInput.trim())}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2.5 rounded-xl transition flex items-center justify-center shrink-0 shadow-sm min-w-[40px] min-h-[40px]"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputExampleDemo() {
  return (
    <div className="max-w-xl mx-auto p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      {/* Container header badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Sample Input Format
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600">
          Demo Reference
        </span>
      </div>

      {/* Demo Box */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
        <div className="text-slate-400 font-sans text-[10px] uppercase font-bold tracking-wider">
          Accepted Fields Example
        </div>

        {/* Clean key-value grid for sample view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-sans font-semibold text-slate-400">
                <th className="pb-1.5 pr-3 font-normal">Name</th>
                <th className="pb-1.5 px-3 font-normal">HKID</th>
                <th className="pb-1.5 px-3 font-normal">CWR No.</th>
                <th className="pb-1.5 px-3 font-normal">CWR Exp</th>
                <th className="pb-1.5 px-3 font-normal">Green Card Exp</th>
                <th className="pb-1.5 pl-3 font-normal">SPP Exp</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-slate-700 font-medium">
                <td className="pt-2 pr-3 font-sans font-bold text-slate-900 whitespace-nowrap">John Doe</td>
                <td className="pt-2 px-3 text-blue-600 font-semibold whitespace-nowrap">A123456(7)</td>
                <td className="pt-2 px-3 whitespace-nowrap">CWR123456</td>
                <td className="pt-2 px-3 whitespace-nowrap">2025-12-31</td>
                <td className="pt-2 px-3 whitespace-nowrap">2026-06-30</td>
                <td className="pt-2 pl-3 whitespace-nowrap">2024-11-15</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}