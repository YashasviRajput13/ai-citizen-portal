
import React, { useState } from 'react';
import { classifyQuery } from '../services/geminiService';
import { ServiceRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([
    { id: '1', subject: 'Inquiry about child benefit eligibility', status: 'Pending', createdAt: new Date() },
    { id: '2', subject: 'URGENT: Water pipe burst near main square', status: 'Pending', createdAt: new Date() },
    { id: '3', subject: 'Application for digital nomad visa extension', status: 'Pending', createdAt: new Date() }
  ]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleClassify = async (id: string, subject: string) => {
    setIsProcessing(id);
    try {
      const classification = await classifyQuery(subject);
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, classification, status: 'Processed' } : req
      ));
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Government Dashboard</h2>
          <p className="text-indigo-200 opacity-90 max-w-xl">
            Simulating the backend of the e-Governance system. Gemini classifies incoming citizen requests by department and priority automatically.
          </p>
        </div>
        <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Incoming Citizen Requests</h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{requests.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Category & Dept</th>
                <th className="px-6 py-4">AI Priority</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{req.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">{req.createdAt.toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    {req.classification ? (
                      <div>
                        <p className="text-sm text-slate-700">{req.classification.category}</p>
                        <p className="text-xs text-indigo-600 font-medium">{req.classification.department}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Awaiting analysis...</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {req.classification ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(req.classification.priority)}`}>
                        {req.classification.priority.toUpperCase()}
                      </span>
                    ) : (
                      <span className="w-24 h-4 bg-slate-100 block rounded animate-pulse"></span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending' ? (
                      <button
                        onClick={() => handleClassify(req.id, req.subject)}
                        disabled={isProcessing === req.id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing === req.id ? 'Processing...' : 'Run Smart Sort'}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-green-600 flex items-center justify-end">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Sorted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Response Speed</p>
          <p className="text-2xl font-bold text-slate-800">4.2 min</p>
          <div className="mt-2 text-xs text-green-600 font-bold flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            -22% since last week
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Categorization Accuracy</p>
          <p className="text-2xl font-bold text-slate-800">98.4%</p>
          <div className="mt-2 text-xs text-slate-400 font-medium">Powered by Gemini-3 Flash</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Automated Handling</p>
          <p className="text-2xl font-bold text-slate-800">72%</p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
