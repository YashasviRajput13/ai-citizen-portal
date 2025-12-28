
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import FormAnalyzer from './components/FormAnalyzer';
import AdminDashboard from './components/AdminDashboard';
import SmartFormFiller from './components/SmartFormFiller';
import Login from './components/Login';
import { Tab } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [language, setLanguage] = useState<string>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = translations[language];

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home setActiveTab={setActiveTab} language={language} />;
      case 'assistant': return <ChatInterface language={language} />;
      case 'explainer': return <FormAnalyzer language={language} />;
      case 'formFiller': return <SmartFormFiller language={language} />;
      case 'admin': return <AdminDashboard language={language} />;
      default: return <Home setActiveTab={setActiveTab} language={language} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return t.portalTitle;
      case 'assistant': return t.assistantTitle;
      case 'explainer': return t.explainerTitle;
      case 'formFiller': return t.formFillerTitle;
      case 'admin': return t.adminTitle;
      default: return 'CivicAI';
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} language={language} />;
  }

  const languages = [
    { code: 'en', label: 'English', icon: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', icon: '🇮🇳' },
    { code: 'mr', label: 'मराठी', icon: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', icon: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', icon: '🇮🇳' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex animate-in fade-in duration-700">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
      
      <main className="flex-1 ml-72">
        <header className="px-10 py-8 flex justify-between items-center sticky top-0 bg-slate-50/80 backdrop-blur-xl z-40 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
               <span className="text-indigo-500">{t.official}</span>
               <span>•</span>
               <span className="text-green-500">{t.identity}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700"
              >
                <span>{languages.find(l => l.code === language)?.icon}</span>
                <span>{languages.find(l => l.code === language)?.label}</span>
                <svg className={`w-4 h-4 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors ${language === lang.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
                    >
                      <span className="text-xl">{lang.icon}</span>
                      <span className="text-sm font-bold">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  ID
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none">Peterson, Sven</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">CIV-RES-88410</p>
                </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-2xl transition-all shadow-sm group"
              title={t.logout}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <div className="px-10 max-w-7xl mx-auto py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
