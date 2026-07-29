import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ActiveRosterPage from './pages/ActiveRosterPage';
import DocScannerPage from './pages/DocScannerPage';
import LicenseCompliancePage from './pages/LicenseCompliancePage';
import { LicenseExpiryProvider } from './context/LicenseExpiryContext';
import { SiteProvider } from './context/SiteContext';
import LoginPage from './pages/LoginPage';
import supabase from './services/supabase/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('roster');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLoginSuccess={(data) => setSession(data.session)} />;
  }

  // Simple UI switching layout shell
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'roster':
        return <ActiveRosterPage />;
      case 'scanner':
        return <DocScannerPage />;
      case 'compliance':
        return <LicenseCompliancePage />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-4xl block mb-2">🚧</span>
              <h2 className="font-bold text-xl text-slate-700">Under Construction</h2>
              <p className="text-slate-400 text-sm mt-1">This screen panel has not been hooked up yet.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <SiteProvider>
      <LicenseExpiryProvider>
        <div className="flex h-screen w-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
          {renderActiveScreen()}
        </div>
      </LicenseExpiryProvider>
    </SiteProvider>
  );
}