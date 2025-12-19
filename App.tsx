
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import FormAnalyzer from './components/FormAnalyzer';
import AdminDashboard from './components/AdminDashboard';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
            <p className="text-sm text-slate-500 font-medium">Republic of Estonia Digital Services Emulator</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="w-6 h-6 bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center rounded-full">ID</span>
                <span className="text-sm font-bold text-slate-700">Digital Residency</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
