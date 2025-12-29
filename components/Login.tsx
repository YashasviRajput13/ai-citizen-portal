
import React, { useState } from 'react';
import { translations } from '../translations';

interface LoginProps {
  onLogin: () => void;
  language: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, language }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'smart' | 'mobile' | 'id'>('smart');
  
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

  // Static Indian Flag background image
  const bgImage = "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden bg-slate-950">
      
      {/* Static Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        
        {/* Optimized Glassmorphism Tint Overlay - Reduced blur for better visibility */}
        <div className="absolute inset-0 backdrop-blur-[6px] bg-black/25 z-10"></div>
        
        {/* Gentle vignette to ensure the white text on the left stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 z-20"></div>
      </div>

      {/* Main Authentication Card with Glassmorphism */}
      <div className="w-full max-w-[1050px] grid grid-cols-1 lg:grid-cols-2 bg-white/10 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20 relative z-30 backdrop-blur-3xl animate-in zoom-in-95 duration-1000">
        
        {/* Left Side: Brand Identity */}
        <div className="p-12 lg:p-16 flex flex-col justify-between text-white relative">
          {/* Internal glass panel for the left side */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-16">
              <div className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tighter block uppercase leading-none">CivicAI</span>
                <span className="text-[10px] font-black text-orange-300 uppercase tracking-[0.4em] mt-1.5">Official Portal</span>
              </div>
            </div>

            <div className="space-y-8">
              <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-xl">
                Your Secure<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400">Digital Gateway.</span>
              </h1>
              <p className="text-white text-lg leading-relaxed max-w-sm font-medium drop-shadow-lg">
                Enter the future of governance. Access all citizen services with a single, unified digital identity.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex items-center space-x-6">
              <div className="flex -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Citizen" className="w-full h-full object-cover opacity-90" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/70">
                1.3M+ Citizens Verified
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="p-12 lg:p-16 flex flex-col justify-center relative bg-black/40 backdrop-blur-xl">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-white/5 border-t-white rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🔑</div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Authenticating</h2>
                <p className="text-white/60 text-sm font-bold tracking-wide uppercase">Securing Handshake Protocol...</p>
              </div>
              <div className="w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white animate-progress origin-left shadow-[0_0_20px_rgba(255,255,255,0.6)]"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Portal Access</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Select Security Token Type</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 group relative overflow-hidden ${
                      selectedMethod === method.id 
                        ? 'bg-white/20 border-white/40 shadow-2xl scale-105 z-10' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform relative z-10">{method.icon}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest relative z-10 ${
                      selectedMethod === method.id ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                    }`}>
                      {method.name}
                    </span>
                    {selectedMethod === method.id && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-1">{t.idNum}</label>
                  <input 
                    type="text" 
                    placeholder="ENTER ID NUMBER" 
                    defaultValue="38001010001"
                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white/40 transition-all font-mono text-center tracking-[0.4em] text-xl placeholder-white/30 shadow-inner"
                  />
                </div>
                
                <button
                  onClick={handleLoginClick}
                  className="w-full bg-white text-slate-950 py-5 rounded-3xl font-black text-lg shadow-[0_15px_50px_rgba(255,255,255,0.15)] hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
                >
                  {t.authenticate}
                </button>
              </div>

              <div className="pt-8 flex items-center justify-center space-x-6 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-white transition-colors">Digital Act</a>
                <span className="opacity-30">•</span>
                <a href="#" className="hover:text-white transition-colors">Help Desk</a>
                <span className="opacity-30">•</span>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
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
          animation: progress 2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
