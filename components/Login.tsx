
import React, { useState } from 'react';
import { translations } from '../translations';

// Fix: Updated LoginProps to include language prop as required by App.tsx to resolve the assignment error
interface LoginProps {
  onLogin: () => void;
  language: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, language }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'smart' | 'mobile' | 'id'>('smart');
  
  // Fix: Utilize translations based on the passed language prop
  const t = translations[language];

  const handleLoginClick = () => {
    setIsVerifying(true);
    // Simulate a secure handshake with the identity provider
    setTimeout(() => {
      onLogin();
    }, 2000);
  };

  const methods = [
    { id: 'smart', name: 'Smart-ID', icon: '📱' },
    { id: 'mobile', name: 'Mobile-ID', icon: '📶' },
    { id: 'id', name: 'ID-Card', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 relative z-10">
        {/* Left Side: Brand & Info */}
        <div className="p-12 lg:p-16 flex flex-col bg-gradient-to-br from-indigo-600 to-slate-900 text-white">
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block">CivicAI</span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">E-Governance Gateway</span>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              One Identity.<br/>
              Every <span className="text-indigo-300">Service.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Securely access over 2,500 public services with your verified digital identity. Powered by the X-Road framework.
            </p>

            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                  <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <span className="text-sm font-semibold">End-to-end encrypted sessions</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                  <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-sm font-semibold">Gemini AI-powered assistance</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
            <span>Department of Digital Affairs</span>
            <span>Version 2.5.0</span>
          </div>
        </div>

        {/* Right Side: Authentication */}
        <div className="p-12 lg:p-16 bg-slate-900 flex flex-col justify-center">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">📱</div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">Verification in Progress</h2>
                <p className="text-slate-400 text-sm">Please check your mobile device for code <span className="text-indigo-400 font-bold">8841</span></p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress origin-left"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl font-black text-white">Secure Access</h2>
                <p className="text-slate-400 text-sm">Select your preferred authentication method</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group ${
                      selectedMethod === method.id 
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl mb-3 group-hover:scale-110 transition-transform">{method.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      selectedMethod === method.id ? 'text-indigo-400' : 'text-slate-400'
                    }`}>
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.idNum}</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 38001010001" 
                    defaultValue="38001010001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
                
                <button
                  onClick={handleLoginClick}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t.authenticate}
                </button>
              </div>

              <div className="pt-8 flex items-center justify-center space-x-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
                <span className="text-slate-800">•</span>
                <a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a>
                <span className="text-slate-800">•</span>
                <a href="#" className="hover:text-indigo-400 transition-colors">Contacts</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
