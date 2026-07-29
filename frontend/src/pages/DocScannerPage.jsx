import React from 'react';
import { useState, useEffect} from 'react';

export default function DocScannerPage() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const handleSubmit = async () => {

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (textInput.trim()) formData.append('raw_text', textInput);
    const API_BASE_URL = import.meta.env.BACKEND_API_URL;

    try {
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
      setFile(null);
      setTextInput('');

    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
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
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            AI
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-2xl text-slate-700 text-sm shadow-sm space-y-2">
            <p className="font-semibold text-slate-900">Ready to scan documents</p>
            <p>
              Click the <strong className="text-blue-600">+</strong> button below to attach employee records, or paste raw text directly into the chat box.
            </p>
          </div>
        </div>

        <InputExampleDemo />


        {/* LOADING UI STATE IN CHAT THREAD */}
        {isSubmitting && (
          <div className="flex gap-3 items-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-600 text-sm shadow-sm flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium text-slate-700">Processing input ...</span>
            </div>
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
            disabled={isSubmitting}
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