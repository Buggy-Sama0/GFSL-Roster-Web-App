import { useState, useEffect } from 'react';

export default function ScanConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  extractedData,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    card_type: '',
    expiry_date: '',
  });

  // Sync state when new extracted data arrives
  useEffect(() => {
    if (extractedData) {
      setFormData({
        card_type: extractedData.card_type || '',
        expiry_date: extractedData.expiry_date || '',
      });
    }
  }, [extractedData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Verify Scan Results</h3>
              <p className="text-[12px] text-slate-500">Confirm or adjust extracted information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body Fields */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              License / Card Type
            </label>
            <select
              name="card_type"
              value={formData.card_type}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="CWR">CWR (Construction Workers Registration)</option>
              <option value="GREEN_CARD">Green Card (Safety Training)</option>
              <option value="SPP">SPP (Security Personnel Permit)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Extracted Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-[0.98] text-[13px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Saving Record...</span>
              </>
            ) : (
              'Confirm & Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}