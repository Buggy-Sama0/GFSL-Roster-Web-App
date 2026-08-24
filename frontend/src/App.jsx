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
          <div className="flex h-screen w-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
            <Sidebar onLogout={handleLogout} checkAdmin={isAdmin} />
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