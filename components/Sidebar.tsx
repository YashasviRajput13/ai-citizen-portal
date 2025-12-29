
import React from 'react';
import { Tab } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, language }) => {
  const t = translations[language];
  
  const menuItems = [
    { id: 'home', label: t.dashboard, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ) },
    { id: 'profile', label: t.profile, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    ) },
    { id: 'formFiller', label: t.formFiller, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    ) },
    { id: 'assistant', label: t.aiSupport, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    ) },
    { id: 'explainer', label: t.formAnalyst, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ) },
    { id: 'admin', label: t.govAdmin, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ) },
  ];

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block">CivicAI</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Digital Sovereignty</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className={`transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {item.icon}
            </div>
            <span className="text-sm">{item.label}</span>
            {activeTab === item.id && (
               <div className="ml-auto w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-white font-bold border border-slate-600">
              SP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">Sven Peterson</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase">E-Resident</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-full text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-slate-700/50 py-2 rounded-lg border border-slate-600/50"
          >
            MANAGE IDENTITY
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
