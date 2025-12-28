
import React, { useState, useRef } from 'react';
import { analyzeForm, extractTextFromImage } from '../services/geminiService';
import { FormAnalysis } from '../types';
import { translations } from '../translations';

interface Props {
  language: string;
}

const FormAnalyzer: React.FC<Props> = ({ language }) => {
  const t = translations[language];
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
      const result = await analyzeForm(text, language);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    setIsOcrLoading(true);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
    
    try {
      const extractedText = await extractTextFromImage(base64Image);
      setText(prev => (prev ? prev + '\n\n' : '') + extractedText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsOcrLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">{t.explainerTitle}</h3>
          <button onClick={isCameraActive ? () => setIsCameraActive(false) : startCamera} className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600">
            {isCameraActive ? 'Cancel' : t.capture}
          </button>
        </div>
        
        {isCameraActive ? (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <button onClick={captureAndScan} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-xl font-bold">Capture</button>
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:outline-none"
            placeholder="..."
          />
        )}
        
        <button onClick={handleAnalyze} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">
          {isLoading ? t.loading : t.analyze}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        {analysis ? (
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900">{analysis.purpose}</h4>
            <div className="bg-indigo-50 p-4 rounded-xl italic font-medium">{analysis.simplifiedExplanation}</div>
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Requirements</h5>
              <ul className="space-y-1">
                {analysis.requirements.map((r, i) => <li key={i} className="text-sm">• {r}</li>)}
              </ul>
            </div>
          </div>
        ) : <p className="text-slate-400 italic">Analysis results will appear here...</p>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FormAnalyzer;
