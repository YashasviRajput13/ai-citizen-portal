
import React, { useState, useRef, useEffect } from 'react';
import { Message, GenericFormDraft } from '../types';
import { askAssistant, parseGenericDraft } from '../services/geminiService';
import { translations } from '../translations';

interface Props {
  language: string;
}

const SmartFormFiller: React.FC<Props> = ({ language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I am your AI Smart Draft Assistant. I can help you prepare a draft for any government application. \n\nWhat kind of form or application do you need to draft today? (e.g., Passport, Driving License, Birth Certificate, etc.)",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<GenericFormDraft | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    "Form Subject (e.g. Passport)",
    "Application Type (e.g. Fresh/Renewal)",
    "Full Name",
    "Father's/Guardian's Name",
    "Date of Birth",
    "Residential Address"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const aiResponse = await askAssistant(
        `We are conducting a conversational form filling for a government document.
        Steps needed: ${steps.join(', ')}.
        Current conversation history: ${messages.length} messages.
        If the user has provided: Subject, Type, Full Name, Father's Name, DOB, and Address, then say: "Great! I have all your details. Let me generate your AI Smart Draft now."
        Otherwise, ask for the missing field in a friendly, plain manner in the citizen's language.
        User said: ${text}`, 
        history, 
        language
      );
      
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse || "...", timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);

      if (aiResponse?.toLowerCase().includes("all your details") || aiResponse?.toLowerCase().includes("draft now")) {
        const fullConv = [...messages, userMessage, assistantMessage].map(m => `${m.role}: ${m.content}`).join('\n');
        const generatedDraft = await parseGenericDraft(fullConv, language);
        setDraft(generatedDraft);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
      <div className="flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden h-full">
        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             </div>
             <h3 className="font-bold text-slate-800">{t.formFillerTitle}</h3>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">DRAFT AGENT ACTIVE</span>
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
                <div className="flex space-x-1">
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
              placeholder="Tell AI your details..."
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-6 pr-24 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-300"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 h-full overflow-y-auto scroll-smooth">
        {draft ? (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex justify-between items-start border-b border-slate-100 pb-8">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">{draft.formSubject}</h2>
                 <p className="text-sm text-slate-500 font-medium tracking-wide">{t.draftComplete}</p>
               </div>
               <div className={`px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-[0.2em] bg-indigo-50 text-indigo-700 border-indigo-200`}>
                 {draft.applicationType}
               </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-6">
                <div className="group transition-all">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{t.fullName}</h4>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 text-lg group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                    {draft.fullName}
                  </div>
                </div>

                <div className="group transition-all">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{t.fatherName}</h4>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 text-lg group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                    {draft.fatherName}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group transition-all">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{t.dob}</h4>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 text-lg group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                      {draft.dateOfBirth}
                    </div>
                  </div>
                  <div className="group transition-all">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Ref ID</h4>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-mono font-bold text-indigo-600 text-lg group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                      #DRAFT-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="group transition-all">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{t.address}</h4>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 text-lg leading-relaxed group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                    {draft.address}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                 <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI Verification Note</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic text-indigo-50/80">
                      "{draft.aiVerificationNote}"
                    </p>
                 </div>
                 <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Confirm & Generate PDF
                </button>
                <button 
                  onClick={() => setDraft(null)}
                  className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
             <div className="relative">
                <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center text-5xl shadow-sm">
                   🪄
                </div>
             </div>
             <div className="max-w-xs space-y-3">
               <h3 className="text-xl font-black text-slate-800 tracking-tight">AI Smart Draft Preview</h3>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 Complete the conversation on the left. Tell me what you need, and I will fill the form for you instantly.
               </p>
             </div>
             <div className="w-full space-y-4 opacity-5">
                <div className="h-10 bg-slate-300 rounded-2xl w-full"></div>
                <div className="h-10 bg-slate-300 rounded-2xl w-2/3"></div>
                <div className="h-20 bg-slate-300 rounded-2xl w-full"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFormFiller;
