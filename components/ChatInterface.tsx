
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { askAssistant } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I am your CivicAI digital assistant. I can explain any government service, help with ID renewals, or guide you through scholarship applications. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "ID Card Renewal process",
    "Small business tax benefits",
    "Digital Nomad Visa costs",
    "Family support grants"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await askAssistant(text, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered a technical issue. Please ensure your session is active and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-white overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09a10.116 10.116 0 001.283-3.562V11m0 0V9a7 7 0 017-7s.007.243.05.707a7.487 7.487 0 01-1.58 4.798M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09a10.116 10.116 0 00-1.283 3.562V11m0 0V9a7 7 0 01-7-7z" /></svg>
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight">GovSupport AI</h3>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Active & Secure</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-2 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-white to-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px] ${
              msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {msg.role === 'user' ? 'ME' : 'AI'}
            </div>
            <div className={`max-w-[75%] px-5 py-4 rounded-3xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
            }`}>
              <div className="prose prose-sm max-w-none leading-relaxed">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">{line}</p>
                ))}
              </div>
              <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end space-x-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">AI</div>
             <div className="bg-white border border-slate-200 rounded-3xl rounded-bl-sm px-6 py-4">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Suggested & Input */}
      <div className="p-6 bg-white border-t border-slate-200">
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
           {suggestedQuestions.map((q, i) => (
             <button 
                key={i}
                onClick={() => handleSend(q)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
             >
                {q}
             </button>
           ))}
        </div>
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-6 pr-24 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all text-sm font-medium"
          />
          <div className="absolute right-2 top-2">
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-[1rem] font-bold hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
