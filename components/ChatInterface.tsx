
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Message } from '../types';
import { askAssistant } from '../services/geminiService';
import { translations } from '../translations';

interface ChatProps {
  language: string;
}

// Audio Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const ChatInterface: React.FC<ChatProps> = ({ language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Official CivicAI Assistant active. I am a voice-enabled government services guide. I can help you with documents, steps, and links for official services.\n\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const stopVoiceMode = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsVoiceMode(false);
  };

  const startVoiceMode = async () => {
    setIsVoiceMode(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = inputCtx;
    outputAudioContextRef.current = outputCtx;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant' && last.id.startsWith('live-')) {
                return [...prev.slice(0, -1), { ...last, content: last.content + text }];
              }
              return [...prev, { id: 'live-' + Date.now(), role: 'assistant', content: text, timestamp: new Date() }];
            });
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => {
          console.error('Live API Error:', e);
          stopVoiceMode();
        },
        onclose: () => stopVoiceMode(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: `
          You are a voice-enabled government services assistant for CivicAI.
          
          Respond ONLY to government service requests (e.g., birth certificate, passport, permits).
          Use verified official sources ONLY (.gov, .gov.in, .nic.in).

          For each request, provide:
          - Required documents
          - Application steps
          - Fees (if available)
          - Official application link

          Rules:
          - Speak clearly, slowly, and in simple language.
          - Do not guess or add unofficial information.
          - Do not store or repeat personal data.
          - If location is required, ask briefly (e.g., "Which state are you in?") and stop.
          - If the request is unclear, ask one short clarification question.
          - Strictly maintain a professional and helpful government tone.
        `,
      },
    });

    sessionRef.current = await sessionPromise;
  };

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
      const errorMessage: Message = { id: Date.now().toString(), role: 'assistant', content: "An error occurred while connecting to official services. Please try again.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    return content.split('\n').map((line, i) => {
      let parts = [];
      let lastIndex = 0;
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(
          <a 
            key={match[2] + i} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-600 hover:text-indigo-800 underline font-bold transition-colors"
          >
            {match[1]}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));
      return <div key={i} className="mb-1">{parts.length > 0 ? parts : line}</div>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative">
      <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-3">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isVoiceMode ? 'bg-indigo-600 animate-pulse shadow-lg shadow-indigo-600/30' : 'bg-slate-100 text-slate-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
           </div>
           <div>
             <h3 className="font-bold text-slate-800 leading-none">{isVoiceMode ? 'Voice Mode Active' : 'Official Service Guide'}</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Official .gov sources</p>
           </div>
        </div>
        <div className="flex items-center space-x-2">
          {isVoiceMode && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Listening</span>
            </div>
          )}
          <button 
            onClick={isVoiceMode ? stopVoiceMode : startVoiceMode}
            className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isVoiceMode 
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                : 'bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-500 shadow-md active:scale-95'
            }`}
          >
            {isVoiceMode ? 'Stop Voice' : 'Start Voice'}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-slate-50/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all animate-in slide-in-from-bottom-2 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              <div className="whitespace-pre-wrap">{formatMessage(msg.content)}</div>
              <span className={`text-[9px] mt-2 block opacity-50 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-6 py-4 rounded-[1.5rem] rounded-tl-none border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Official Registry</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        {isVoiceMode ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
             <div className="flex items-end space-x-1.5 h-10">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-indigo-500 rounded-full transition-all duration-150 animate-pulse"
                    style={{ 
                      height: `${10 + Math.random() * 90}%`,
                      animationDelay: `${i * 0.05}s`,
                      opacity: 0.3 + (Math.random() * 0.7)
                    }}
                  ></div>
                ))}
             </div>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] animate-pulse">Speak to verify your request</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Passport, License, or Certificate..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-6 pr-32 py-4.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner text-slate-800 placeholder-slate-400"
              />
              <div className="absolute right-2 top-2 flex space-x-2">
                <button 
                  onClick={startVoiceMode}
                  className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Switch to Voice"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 shadow-md"
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest flex items-center justify-center">
               <svg className="w-3 h-3 mr-1.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
               Security Protocol v4.2 • Official Handshake Active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
