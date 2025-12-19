
import React, { useState } from 'react';
import { Tab, ServiceDetailInfo } from '../types';
import { fetchServiceInfo } from '../services/geminiService';

interface HomeProps {
  setActiveTab: (tab: Tab) => void;
}

const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetailInfo | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const categories = [
    { title: 'Family & Benefits', icon: '👨‍👩‍👧', count: 12, color: 'bg-blue-50 text-blue-600', description: 'Manage birth registrations, child allowances, and family support systems.' },
    { title: 'Business & Tax', icon: '💼', count: 8, color: 'bg-indigo-50 text-indigo-600', description: 'Register companies, declare taxes, and apply for digital entrepreneurship permits.' },
    { title: 'Immigration', icon: '🌍', count: 15, color: 'bg-emerald-50 text-emerald-600', description: 'E-Residency applications, visa extensions, and residency permits.' },
    { title: 'Justice & ID', icon: '🆔', count: 4, color: 'bg-slate-50 text-slate-600', description: 'ID card renewals, digital signatures, and legal documentation access.' },
  ];

  const recentUpdates = [
    { title: "Digital Nomad Visa v3.0", date: "2 hours ago", status: "Updated" },
    { title: "Universal Child Benefit", date: "Yesterday", status: "Active" },
    { title: "e-Residency 2025 Plan", date: "Mar 15", status: "In Review" },
  ];

  const handleServiceClick = async (category: any) => {
    setSelectedService(category);
    setIsLoadingDetails(true);
    setServiceDetails(null);
    try {
      const info = await fetchServiceInfo(category.title);
      setServiceDetails(info);
    } catch (error) {
      console.error("Failed to load service details", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetail = () => {
    setSelectedService(null);
    setServiceDetails(null);
  };

  if (selectedService) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex items-center space-x-4">
          <button 
            onClick={closeDetail}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center space-x-3">
             <div className={`w-10 h-10 ${selectedService.color} rounded-xl flex items-center justify-center text-xl`}>
               {selectedService.icon}
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedService.title}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              {isLoadingDetails ? (
                <div className="space-y-4 py-8">
                  <div className="h-6 bg-slate-100 rounded-full w-1/3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-50 rounded-full w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-slate-50 rounded-full w-4/6 animate-pulse"></div>
                  </div>
                  <div className="pt-8 grid grid-cols-2 gap-4">
                     <div className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
                     <div className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
                  </div>
                </div>
              ) : serviceDetails ? (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Service Summary</h3>
                    <p className="text-slate-700 text-lg leading-relaxed">{serviceDetails.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Features</h3>
                      <ul className="space-y-3">
                        {serviceDetails.features.map((f, i) => (
                          <li key={i} className="flex items-start space-x-3 text-slate-600">
                             <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                             <span className="text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Application Process</h3>
                      <div className="space-y-4">
                        {serviceDetails.steps.map((s, i) => (
                          <div key={i} className="flex items-center space-x-3">
                             <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                             <span className="text-sm text-slate-700 font-medium">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 italic">No details available for this service.</p>
              )}
            </div>

            <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                   <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Gemini Smart Insight</span>
                </div>
                {isLoadingDetails ? (
                  <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                ) : (
                  <p className="text-lg font-medium leading-relaxed italic text-indigo-50">
                    "{serviceDetails?.aiInsight}"
                  </p>
                )}
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Availability Status</h4>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Current Load</span>
                  <span className="text-green-600 font-black text-xs px-2 py-1 bg-green-50 rounded-lg">NORMAL</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Typical Delay</span>
                  <span className="text-slate-500 text-sm font-medium">{serviceDetails?.processingTime || '...'}</span>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">
                  Begin Application
                </button>
                <button 
                  onClick={() => setActiveTab('assistant')}
                  className="w-full bg-slate-50 text-slate-700 py-4 rounded-2xl font-black border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Ask AI About This
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-100 rounded-[2rem] border border-slate-200 space-y-4">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Documents</h4>
               <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center space-x-3">
                    <span className="text-xl">💳</span>
                    <span className="text-xs font-bold text-slate-700">National ID Card</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center space-x-3">
                    <span className="text-xl">📄</span>
                    <span className="text-xs font-bold text-slate-700">Digital Signature (PIN 2)</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl shadow-indigo-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 blur-3xl"></div>
        
        <div className="relative p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Next Generation Digital State</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Access your digital <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">future today.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
              CivicAI is the world's most advanced citizen interface, powered by Gemini to simplify 
              bureaucracy into a seamless digital conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setActiveTab('assistant')}
                className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center shadow-xl shadow-indigo-600/20"
              >
                <span>Speak to Assistant</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
              <button 
                onClick={() => setActiveTab('explainer')}
                className="px-8 py-4 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl font-bold hover:bg-slate-700 transition-all"
              >
                Simplify a Form
              </button>
            </div>
          </div>

          <div className="lg:w-1/3 hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Active</div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-pulse"></div>
                  <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20"></div>
                    <div className="h-10 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Public Service Catalog</h2>
            <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">EXPLORE ALL</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, i) => (
              <div 
                key={i} 
                onClick={() => handleServiceClick(cat)}
                className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-800">{cat.count}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Services</p>
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cat.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{cat.description}</p>
                <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar/Updates */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Activity</h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              {recentUpdates.map((update, i) => (
                <div key={i} className="flex items-start space-x-4 border-l-2 border-slate-100 pl-4 hover:border-indigo-400 transition-colors cursor-pointer group">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{update.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{update.date}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    {update.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full bg-slate-50 border-t border-slate-100 p-4 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              VIEW FULL LOG
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.2em] mb-2">Did you know?</p>
              <h4 className="text-lg font-bold mb-3">AI speeds up visa processing by 400%</h4>
              <p className="text-sm text-indigo-100/80 mb-4 leading-relaxed">Gemini helps our officers categorize requests in real-time, reducing wait times globally.</p>
              <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors backdrop-blur-md">Learn More</button>
            </div>
            <svg className="absolute bottom-[-20%] right-[-10%] w-32 h-32 text-white/5 group-hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
