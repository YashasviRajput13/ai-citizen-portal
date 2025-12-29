
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Message } from '../types';
import { askProfileAssistant, extractProfileFromImage } from '../services/geminiService';
import { translations } from '../translations';

interface Props {
  language: string;
}

const IdentityProfile: React.FC<Props> = ({ language }) => {
  const t = translations[language];
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "Sven Peterson",
    dateOfBirth: "12/05/1990",
    gender: "Male",
    state: "Tallinn",
    district: "Harju",
    aadhaarMasked: "XXXX-XXXX-8841",
    hasDocument: true
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to your Identity Vault. I am your Profile Assistant. I help you securely manage your personal data for government services.\n\nWould you like to update your details or upload an identity document for magic pre-filling?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await askProfileAssistant(text, history, language);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "...", timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const extracted = await extractProfileFromImage(base64);
        setProfile(prev => ({ ...prev, ...extracted, hasDocument: true }));
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "✨ Magic Fill complete! I've extracted your details from the document. Please verify them in your profile card.",
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-[calc(100vh-160px)]">
      {/* Profile Card Section */}
      <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Digital Identity</h3>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${profile.hasDocument ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              {profile.hasDocument ? 'Document Verified' : 'Incomplete'}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                👤
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="text-lg font-black text-slate-900">{profile.fullName || 'Not set'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-800">{profile.dateOfBirth || '--/--/----'}</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                  <p className="text-sm font-bold text-slate-800">{profile.gender || '---'}</p>
               </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Residential Address</p>
               <p className="text-sm font-bold text-slate-800">{profile.district}, {profile.state}</p>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
               <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Identity Number (Aadhaar)</p>
                    <p className="text-lg font-mono font-bold tracking-widest">{profile.aadhaarMasked || 'XXXX-XXXX-XXXX'}</p>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
               </div>
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all active:scale-95"
             >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>Upload ID Card</span>
                  </>
                )}
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
             <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
               Documents are processed on-device.<br/>Gemini Flash Privacy Shield Active.
             </p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 space-y-4">
           <div className="flex items-center space-x-2">
              <span className="text-xl">🛡️</span>
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Privacy Protocol</h4>
           </div>
           <p className="text-xs text-indigo-700 leading-relaxed font-medium">
             Identity data is used exclusively for pre-filling official forms. We mask your Aadhaar number and never store plain-text biometric data.
           </p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden h-full">
        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             </div>
             <h3 className="font-bold text-slate-800">Profile Assistant</h3>
          </div>
          <div className="flex space-x-1">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-75"></div>
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all animate-in slide-in-from-bottom-2 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[9px] mt-2 block opacity-50 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-5 py-4 rounded-3xl rounded-tl-none border border-slate-200">
                <div className="flex space-x-1 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell me your details (Name, DOB, Gender...)"
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-6 pr-24 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityProfile;
