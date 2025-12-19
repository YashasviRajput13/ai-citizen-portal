
import React, { useState } from 'react';
import { analyzeForm } from '../services/geminiService';
import { FormAnalysis } from '../types';

const FormAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Paste Form Text</h3>
          <p className="text-sm text-slate-500 mb-4">
            Stuck on a confusing government form? Paste the instructions or legal text here and CivicAI will explain it in plain English.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text from a PDF, website, or scanned document here..."
            className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !text.trim()}
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing...
              </>
            ) : 'Simplify Form'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {analysis ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center space-x-2 mb-6 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <h3 className="text-xl font-bold">Analysis Result</h3>
            </div>
            
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Purpose</h4>
                <p className="text-slate-700 leading-relaxed">{analysis.purpose}</p>
              </section>

              <section>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Simplified Summary</h4>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                  <p className="text-indigo-900 font-medium italic">"{analysis.simplifiedExplanation}"</p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">What you need</h4>
                  <ul className="space-y-2">
                    {analysis.requirements.map((req, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-slate-700">
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Deadlines</h4>
                  <p className="text-sm text-slate-700">{analysis.deadlines}</p>
                </section>
              </div>

              <section className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  Avoid These Mistakes
                </h4>
                <ul className="space-y-1">
                  {analysis.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-xs text-amber-900">• {mistake}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-12">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-lg font-medium">Ready to Analyze</p>
            <p className="text-sm">Paste some text and hit "Simplify Form" to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAnalyzer;
