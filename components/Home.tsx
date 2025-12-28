
import React, { useState, useEffect } from 'react';
import { Tab, ServiceDetailInfo, RejectionPrediction } from '../types';
import { fetchServiceInfo, predictRejectionRisk } from '../services/geminiService';
import { translations } from '../translations';

interface HomeProps {
  setActiveTab: (tab: Tab) => void;
  language: string;
}

const Home: React.FC<HomeProps> = ({ setActiveTab, language }) => {
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetailInfo | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [completedChecklist, setCompletedChecklist] = useState<Record<number, boolean>>({});
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<RejectionPrediction | null>(null);

  const t = translations[language];

  const categories = [
    { title: 'Family & Benefits', icon: '👨‍👩‍👧', count: 12, color: 'bg-blue-50 text-blue-600', description: 'Manage birth registrations, child allowances, and family support systems.' },
    { title: 'Business & Tax', icon: '💼', count: 8, color: 'bg-indigo-50 text-indigo-600', description: 'Register companies, declare taxes, and apply for digital entrepreneurship permits.' },
    { title: 'Immigration', icon: '🌍', count: 15, color: 'bg-emerald-50 text-emerald-600', description: 'E-Residency applications, visa extensions, and residency permits.' },
    { title: 'Justice & ID', icon: '🆔', count: 4, color: 'bg-slate-50 text-slate-600', description: 'ID card renewals, digital signatures, and legal documentation access.' },
  ];

  const govMetrics = [
    { label: "Digital Services", value: "99%", trend: "stable" },
    { label: "Paper Saved (tons)", value: "1,240", trend: "+12%" },
    { label: "Identity Verified", value: "1.3M", trend: "+5%" },
    { label: "AI Routing Speed", value: "0.4s", trend: "-10%" }
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
    setCompletedChecklist({});
    setPrediction(null);
    try {
      const info = await fetchServiceInfo(category.title, language);
      setServiceDetails(info);
    } catch (error) {
      console.error("Failed to load service details", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePredictRisk = async () => {
    if (!selectedService || !serviceDetails) return;
    setIsPredicting(true);
    try {
      const result = await predictRejectionRisk(selectedService.title, serviceDetails.summary, language);
      setPrediction(result);
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setIsPredicting(false);
    }
  };

  const toggleChecklist = (index: number) => {
    setCompletedChecklist(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const closeDetail = () => {
    setSelectedService(null);
    setServiceDetails(null);
    setPrediction(null);
  };

  const checklistProgress = serviceDetails?.checklist 
    ? (Object.values(completedChecklist).filter(Boolean).length / serviceDetails.checklist.length) * 100 
    : 0;

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
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
              {isLoadingDetails ? (
                <div className="space-y-4 py-8">
                  <div className="h-6 bg-slate-100 rounded-full w-1/3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-50 rounded-full w-5/6 animate-pulse"></div>
                  </div>
                </div>
              ) : serviceDetails ? (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Summary</h3>
                       <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">Flash AI Model Active</span>
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">{serviceDetails.summary}</p>
                  </div>

                  <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.checklist}</h3>
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                        {Math.round(checklistProgress)}% {t.ready}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6 overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${checklistProgress}%` }}></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serviceDetails.checklist.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleChecklist(idx)}
                          className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left ${completedChecklist[idx] ? 'bg-white border-green-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:border-indigo-200'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${completedChecklist[idx] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                            {completedChecklist[idx] && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={`text-xs font-bold leading-tight ${completedChecklist[idx] ? 'text-slate-900' : 'text-slate-500'}`}>
                            {item}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {prediction && (
                    <div className="bg-slate-950 rounded-[2rem] p-8 text-white space-y-8 animate-in zoom-in duration-500">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
                        <div className="space-y-1 text-center md:text-left">
                          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{t.riskPredictor}</h3>
                          <p className="text-2xl font-black">Success Forecast</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24">
                            <svg className="w-full h-full -rotate-90">
                              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                              <circle 
                                cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className={`${prediction.approvalProbability > 70 ? 'text-green-500' : 'text-amber-500'} transition-all duration-1000`}
                                strokeDasharray={276}
                                strokeDashoffset={276 - (276 * prediction.approvalProbability) / 100}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-lg">
                              {prediction.approvalProbability}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             {t.redFlags}
                           </h4>
                           <ul className="space-y-3">
                              {prediction.redFlags.map((flag, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start space-x-2">
                                   <span className="text-red-500 font-bold">•</span>
                                   <span>{flag}</span>
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             {t.mitigation}
                           </h4>
                           <ul className="space-y-3">
                              {prediction.mitigationSteps.map((step, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start space-x-2">
                                   <span className="text-green-500 font-bold">•</span>
                                   <span>{step}</span>
                                </li>
                              ))}
                           </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI Insight</span>
                  </div>
                  <p className="text-lg font-medium leading-relaxed italic text-indigo-50">
                    "{serviceDetails?.aiInsight}"
                  </p>
               </div>
               <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-indigo-400/10 blur-[80px] rounded-full"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-3">
                <button 
                  disabled={checklistProgress < 100}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
                >
                  {t.beginApp}
                </button>
                
                <button 
                  onClick={handlePredictRisk}
                  disabled={isPredicting || !serviceDetails}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-slate-800 transition-all"
                >
                  {isPredicting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : t.riskPredictor}
                </button>

                <button 
                  onClick={() => setActiveTab('assistant')}
                  className="w-full bg-slate-50 text-slate-700 py-4 rounded-2xl font-black border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  {t.askAi}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-cyan-600/10 blur-[100px] rounded-full"></div>

          <div className="flex-1 space-y-8 text-center lg:text-left relative z-10">
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1] tracking-tight">
              {t.welcome.split(' ').slice(0, -1).join(' ')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{t.welcome.split(' ').pop()}</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setActiveTab('assistant')}
                className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl active:scale-95"
              >
                {t.speakAssistant}
              </button>
              <button 
                onClick={() => setActiveTab('explainer')}
                className="px-8 py-4 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-95"
              >
                {t.simplifyForm}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto relative z-10">
             {govMetrics.map((m, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-1 hover:bg-white/10 transition-colors">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
                   <p className="text-2xl font-black text-white">{m.value}</p>
                   <p className={`text-[10px] font-bold ${m.trend.startsWith('+') ? 'text-green-400' : m.trend.startsWith('-') ? 'text-blue-400' : 'text-slate-400'}`}>
                      {m.trend}
                   </p>
                </div>
             ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{t.catalog}</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Governance 2.0</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, i) => (
              <div key={i} onClick={() => handleServiceClick(cat)} className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all hover:shadow-lg">
                <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{t.recentActivity}</h2>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            {recentUpdates.map((update, i) => (
              <div key={i} className="flex items-start space-x-4 border-l-2 border-slate-100 pl-4 hover:border-indigo-500 transition-colors cursor-default group">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{update.title}</h4>
                  <p className="text-xs text-slate-500">{update.date}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-3 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest border-t border-slate-50 pt-4 mt-4">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
