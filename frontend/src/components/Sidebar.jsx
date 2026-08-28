import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ onLogout, checkAdmin, isOpen, onClose }) {
  const allNavItems = [
    { path: '/roster', label: 'Active Roster', adminOnly: false },
    { path: '/scan', label: 'AI Doc Scanner', adminOnly: false },
    { path: '/licences', label: 'Compliance & Licenses', adminOnly: false },
    { path: '/accounts', label: 'Accounts Receivable', adminOnly: true },
    { path: '/leave', label: 'Leave Management', adminOnly: false },
    { path: '/settings', label: 'Settings', adminOnly: false },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || checkAdmin);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between h-screen shrink-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header & Logo */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-bold text-lg tracking-wider text-slate-100">GFSL</span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 flex flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // Auto-close drawer on link click on mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
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
    </>
  );
}