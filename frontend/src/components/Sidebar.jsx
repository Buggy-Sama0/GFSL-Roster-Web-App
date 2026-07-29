import React from 'react';

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  const navItems = [
    { id: 'roster', label: 'Active Roster', icon: '' },
    { id: 'scanner', label: 'AI Doc Scanner', icon: '' },
    { id: 'compliance', label: 'Compliance & Licenses', icon: '' },
    { id: 'leave', label: 'Leave Management', icon: '' },
    { id: 'settings', label: 'Settings', icon: '' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 h-screen">
      <div>
        {/* ShieldRoster Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-bold text-lg tracking-wider text-slate-100">GFSL</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Log Out Button */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full py-2.5 text-sm font-semibold text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}