import React from 'react';
import DialogBox from './Dialog_box';

export default function ShiftCell({ status, hours, label, employeeId, date, onToggle, onDialogClick}) {
  // STATE A: Approved Leave Block
  if (status === 'On Leave') {
    return (
      <td className="p-2 text-center">
        <div 
          className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 flex flex-col items-center justify-center gap-1 shadow-sm select-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(59, 130, 246, 0.05) 5px, rgba(59, 130, 246, 0.05) 10px)'
          }}
          onClick={() => onDialogClick(employeeId, date)}
        >
          <span className="text-lg">🧳✈️⛱️</span>
          <span className="text-xs font-bold text-blue-700">{label}</span>
        </div>
      </td>
    );
  }

  // STATE B: Expired License Block
  if (status === 'expired') {
    return (
      <td className="p-2 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col items-center justify-center gap-1 shadow-sm select-none">
          <span className="text-red-500 text-base">⚠️</span>
          <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-tight">Expired License</span>
        </div>
      </td>
    );
  }
  const isScheduled = status === 'On Duty' || status === 'Night';
  // STATE C: Scheduled Shift Block
  return (
    <td 
      className="p-2 text-center cursor-pointer select-none group"
      onClick={() => {
        // console.log(`🎯 DOM Click captured on Cell! Employee: ${employeeId}, Day: ${date}, Status: ${status}`);
        onToggle(employeeId, date);
      }} 
    >
      {/* Outer Card Grid Block */}
      <div className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all duration-200 ${
        isScheduled 
          ? 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-400 group-hover:bg-emerald-100/70' 
          : 'bg-slate-50 border-slate-200 group-hover:border-slate-300 group-hover:bg-slate-100/70'
      }`}>
        
        {/* Toggle Pill Track */}
        <div className={`w-8 h-4 rounded-full relative p-0.5 transition-colors duration-200 ${
          isScheduled ? 'bg-emerald-500' : 'bg-slate-100'
        }`}>
          {/* Toggle Sliding Circle */}
          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 left-1 transition-transform duration-200 ${
            isScheduled ? 'translate-x-4' : 'translate-x-0'
          }`}></div>
        </div>
        
        {/* Time Text Display */}
        <span className={`text-xs font-bold transition-colors ${
          isScheduled ? 'text-emerald-800' : 'text-slate-400 font-medium'
        }`}>
          {isScheduled ? hours : 'OFF'}
        </span>

      </div>
    </td>
  );
}

                        