
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import FormAnalyzer from './components/FormAnalyzer';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { Tab } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home setActiveTab={setActiveTab} />;
      case 'assistant': return <ChatInterface />;
      case 'explainer': return <FormAnalyzer />;
      case 'admin': return <AdminDashboard />;
      default: return <Home setActiveTab={setActiveTab} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'Citizen Portal';
      case 'assistant': return 'AI Digital Assistant';
      case 'explainer': return 'Smart Form Explainer';
      case 'admin': return 'Smart Query Classification (Admin)';
      default: return 'CivicAI';
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex animate-in fade-in duration-700">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-72">
        <header className="px-10 py-8 flex justify-between items-center sticky top-0 bg-slate-50/80 backdrop-blur-xl z-40">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
               <span className="text-indigo-500">Official</span>
               <span>•</span>
               <span>Encrypted Session</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  ID
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none">Peterson, Sven</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">EST-RES-88410</p>
                </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-2xl transition-all shadow-sm group"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <div className="px-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
