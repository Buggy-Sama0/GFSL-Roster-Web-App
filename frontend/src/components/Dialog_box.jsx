export default function DialogBox({ ModalData, onResolve, onClose }) {
    return (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                
                {/* Modal Header */}
                <div className="bg-blue-600 px-6 py-4 text-white flex items-center gap-3">
                  <span className="text-2xl">🌴</span>
                  <div>
                    <h3 className="font-bold text-base leading-tight">Resolve Leave Conflict</h3>
                    <p className="text-[10px] text-blue-100 tracking-wide uppercase font-semibold">Operational Policy Overwrite</p>
                  </div>
                </div>

                {/* Modal Body Info Block */}
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-1.5">
                    <p className="text-xs text-slate-500 font-medium">Employee Context</p>
                    <p className="text-sm font-bold text-slate-950">{ModalData.employeeName} ({ModalData.employeeRole})</p>
                    <div className="h-px bg-slate-200 my-1"></div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Scheduled Date:</span>
                      <span className="font-bold text-slate-800">{ModalData.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Current Status:</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{ModalData.leaveLabel}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed text-center px-2">
                    In physical security operations, to schedule a guard during approved leave, you must legally terminate or pause their leave record. Please select an action to update the database state:
                  </p>
                </div>

                {/* Modal Action Buttons */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col gap-2">
                  <button 
                    onClick={() => onResolve('schedule')}
                    className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                  >
                    Cancel Leave & Schedule {ModalData.defaultShift}
                  </button>

                  <button 
                    onClick={() => onResolve('off')}
                    className="w-full text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 px-4 rounded-xl active:scale-[0.98] transition"
                  >
                    Cancel Leave & Make Guard "Off"
                  </button>
        
                  <button 
                    onClick={onClose}
                    className="w-full text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 py-2.5 px-4 rounded-xl transition"
                  >
                    Keep Leave & Exit
                  </button>
                </div>

              </div>
            </div>

    );
}