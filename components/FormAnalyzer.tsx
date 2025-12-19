
import React, { useState, useRef } from 'react';
import { analyzeForm, extractTextFromImage } from '../services/geminiService';
import { FormAnalysis } from '../types';

const FormAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const result = await analyzeForm(text);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    setIsOcrLoading(true);
    stopCamera();
    
    try {
      const extractedText = await extractTextFromImage(base64Image);
      setText(prev => (prev ? prev + '\n\n' : '') + extractedText);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to scan document. Please try again or paste text manually.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Analyze Form</h3>
            <button 
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                isCameraActive 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{isCameraActive ? 'Cancel Scan' : 'Scan Physical Form'}</span>
            </button>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            Stuck on a confusing government form? Paste the text or use your camera to scan physical documents.
          </p>

          <div className="relative group min-h-[16rem]">
            {isCameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[2px] border-indigo-500/30 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="absolute bottom-4 inset-x-0 flex justify-center px-4">
                  <button 
                    onClick={captureAndScan}
                    className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Capture & OCR</span>
                  </button>
                </div>

                <div className="absolute top-4 left-4">
                   <span className="bg-black/50 backdrop-blur-md text-[10px] text-white font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-widest">Live Preview</span>
                </div>
              </div>
            ) : isOcrLoading ? (
              <div className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-4">
                 <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xl">📄</div>
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">Performing Digital OCR</p>
                    <p className="text-xs text-slate-500">Gemini Vision is extracting text...</p>
                 </div>
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text or use the camera to scan instructions..."
                className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm resize-none"
              />
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || isCameraActive || isOcrLoading || !text.trim()}
            className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/10"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                AI Deep Analysis...
              </>
            ) : 'Simplify Form Content'}
          </button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="space-y-6">
        {analysis ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center space-x-2 mb-6 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <h3 className="text-xl font-bold tracking-tight">AI Interpretation</h3>
            </div>
            
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Purpose</h4>
                <p className="text-slate-700 leading-relaxed font-medium">{analysis.purpose}</p>
              </section>

              <section>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Plain Language Summary</h4>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-2xl">
                  <p className="text-indigo-900 font-bold leading-relaxed italic">"{analysis.simplifiedExplanation}"</p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Requirements</h4>
                  <ul className="space-y-3">
                    {analysis.requirements.map((req, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Timeline</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 font-semibold">{analysis.deadlines}</p>
                  </div>
                </section>
              </div>

              <section className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.2em] mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  Bureaucratic Pitfalls
                </h4>
                <ul className="grid grid-cols-1 gap-2">
                  {analysis.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-xs text-amber-900 flex items-center bg-white/50 px-3 py-2 rounded-lg">
                      <span className="mr-2">⚠️</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white p-12 transition-all">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-black text-slate-800 tracking-tight mb-2">Awaiting Content</p>
            <p className="text-sm text-center max-w-xs text-slate-500">
              Paste document text or scan a physical form to receive a simplified interpretation of the requirements and deadlines.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAnalyzer;
