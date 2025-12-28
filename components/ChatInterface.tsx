
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { askAssistant } from '../services/geminiService';
import { translations } from '../translations';

interface ChatProps {
  language: string;
}

const ChatInterface: React.FC<ChatProps> = ({ language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: translations[language].assistantTitle + " active. How can I help you?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const aiResponse = await askAssistant(text, history, language);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse || "Error", timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{t.assistantTitle}</h3>
        <span className="text-[10px] font-bold text-green-500 uppercase">{t.securityActive}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-5 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type here..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-6 pr-24 py-4 focus:outline-none"
          />
          <button onClick={() => handleSend()} className="absolute right-2 top-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
