import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ActiveRosterPage from './pages/ActiveRosterPage';
import DocScannerPage from './pages/DocScannerPage';
import LicenseCompliancePage from './pages/LicenseCompliancePage';
import AccountStatementPage from './pages/AccountsReceivablePage';
import { LicenseExpiryProvider } from './context/LicenseExpiryContext';
import { SiteProvider } from './context/SiteContext';
import LoginPage from './pages/LoginPage';
import supabase from './services/supabase/client';
import { useIdleTimeout } from './components/hooks/useIdleTimeout';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null)

  // Mobile Navigation Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useIdleTimeout(30); // idle timeout to 30 minutes

  // Fetch role specifically for the authenticated user ID
  useEffect(() => {
    let isMounted = true;

    // Helper to fetch session and role sequentially before removing loading state
    const syncAuthAndRole = async (currentSession, showSpinner = false) => {
      if (showSpinner && isMounted) {
        setLoading(true);
      }
      if (currentSession?.user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (isMounted) setUserRole(data?.role || null);
        } catch (err) {
          console.error('Error fetching role:', err);
          if (isMounted) setUserRole(null);
        }
      } else {
        if (isMounted) setUserRole(null);
      }
      if (isMounted) setLoading(false);
    };

    // Initial Load Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      syncAuthAndRole(session, false);
    });

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      // Only lock UI with spinner during explicit login/logout events, NOT background token refreshes
      const isAuthTransition = _event === 'SIGNED_IN' || _event === 'SIGNED_OUT';
      syncAuthAndRole(session, isAuthTransition);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // if (!session) {
  //   return (
  //     <Routes>
  //       <Route path="/login" element={<LoginPage onLoginSuccess={(data) => setSession(data.session)} />} />
  //       <Route path="*" element={<Navigate to="/login" replace />} />
  //     </Routes>
  //   );
  // } 

  const isAdmin = userRole === 'portal_admin'

  // Simple UI not built yet layout 
  const renderActiveScreen = () => {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <span className="text-4xl block mb-2">🚧</span>
          <h2 className="font-bold text-xl text-slate-700">Under Construction</h2>
          <p className="text-slate-400 text-sm mt-1">This screen panel has not been hooked up yet.</p>
        </div>
      </div>
    );
  };

  return (
    <SiteProvider>
      <LicenseExpiryProvider>
        {!session ? (
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={(data) => setSession(data.session)} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
            {/* Mobile Header Bar (Visible on mobile screens) */}
            <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-base tracking-wider text-slate-100">GFSL</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Open Navigation Menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </header>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} checkAdmin={isAdmin}  />
            <Routes>
              <Route path="/" element={<Navigate to="/roster" replace />} />
              <Route path="/login" element={<Navigate to="/roster" replace />} />
              <Route path="/roster" element={<ActiveRosterPage />} />
              <Route path="/scan" element={<DocScannerPage />} />
              <Route path="/licences" element={<LicenseCompliancePage />} />
              <Route path="/accounts" element={isAdmin ? <AccountStatementPage /> : <Navigate to="/roster" replace />} />
              <Route path="/leave" element={renderActiveScreen()} />
              <Route path="/settings" element={renderActiveScreen()} />
              <Route path="*" element={<Navigate to="/roster" replace />} />
            </Routes>
          </div>
        )}
      </LicenseExpiryProvider>
    </SiteProvider>
  );
}