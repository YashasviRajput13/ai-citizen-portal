
import React from 'react';
import { Tab } from '../types';

interface HomeProps {
  setActiveTab: (tab: Tab) => void;
}

const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const categories = [
    { title: 'Family & Education', icon: '👨‍👩‍👧', count: 12 },
    { title: 'Business & Taxes', icon: '💼', count: 8 },
    { title: 'Immigration & Visas', icon: '🌍', count: 15 },
    { title: 'Identity & Legal', icon: '🆔', count: 4 },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-6 md:w-2/3">
          <div className="inline-block px-3 py-1 bg-indigo-500 bg-opacity-30 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase">
            Estonia-Inspired e-Governance
          </div>
          <h1 className="text-5xl font-extrabold leading-tight">
            The Future of <br/>Transparent Governance
          </h1>
          <p className="text-indigo-100 text-lg max-w-lg font-medium opacity-90 leading-relaxed">
            Welcome to CivicAI, your digital gateway to public services. Our AI removes paperwork friction, helping you get things done in minutes, not weeks.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('assistant')}
              className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Ask AI Assistant
            </button>
            <button 
              onClick={() => setActiveTab('explainer')}
              className="bg-indigo-500 text-white border border-indigo-400 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-400 transition-all shadow-lg"
            >
              Analyze a Form
            </button>
          </div>
        </div>
        <div className="relative z-10 md:w-1/3 flex justify-center">
            <div className="w-64 h-64 bg-indigo-400 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-32 h-32 text-indigo-100 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
            </div>
        </div>
        {/* Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-indigo-800 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Browse by Category</h2>
            <button className="text-indigo-600 font-bold hover:underline">View All Services →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-md cursor-pointer group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="font-bold text-slate-800 mb-1">{cat.title}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{cat.count} Services Available</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h3 className="text-3xl font-bold">Why AI Governance?</h3>
                <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold">24/7 Availability</h4>
                            <p className="text-slate-400 text-sm">Government never closes. Get answers at 3 AM or 3 PM.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold">Radical Transparency</h4>
                            <p className="text-slate-400 text-sm">Automated tracking ensures your request is never "lost" in the system.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold">Zero Jargon</h4>
                            <p className="text-slate-400 text-sm">Gemini translates legalese into human-centered instructions.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/50">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09a10.116 10.116 0 001.283-3.562V11m0 0V9a7 7 0 017-7s.007.243.05.707a7.487 7.487 0 01-1.58 4.798M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09a10.116 10.116 0 00-1.283 3.562V11m0 0V9a7 7 0 01-7-7z" /></svg>
                    </div>
                    <h4 className="text-xl font-bold">Secure Digital ID</h4>
                    <p className="text-slate-400 text-sm">Your data is encrypted and managed through our unified digital sovereignty framework.</p>
                    <button className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl transition-colors font-bold">Verify Your Identity</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
