
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
      
      let shouldProcess = true;
      // If the AI identifies a high priority or specific concerning reason, we prompt the admin
      if (classification.priority === 'High') {
        shouldProcess = window.confirm(
          `CRITICAL ALERT: ${classification.urgencyReason}\n\nThis request has been flagged as HIGH PRIORITY. Would you like to mark it as processed and notify the emergency response team?`
        );
      }

      if (shouldProcess) {
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, classification, status: 'Processed' } : req
        ));
      } else {
        // Still save the classification so the admin can see it, but keep status as Pending
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, classification, status: 'Pending' } : req
        ));
      }
    } catch (error) {
      console.error('Classification error:', error);
      alert('Failed to classify request. Please check your API key or connection.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePrint = (req: ServiceRequest) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const classificationHtml = req.classification ? `
      <div class="section">
        <h2>AI Classification Result</h2>
        <div class="grid">
          <div><strong>Category:</strong> ${req.classification.category}</div>
          <div><strong>Department:</strong> ${req.classification.department}</div>
          <div><strong>Priority:</strong> <span class="priority-${req.classification.priority.toLowerCase()}">${req.classification.priority}</span></div>
        </div>
        <p><strong>Urgency Analysis:</strong> ${req.classification.urgencyReason}</p>
      </div>
    ` : '<p><em>No AI classification performed yet.</em></p>';

    printWindow.document.write(`
      <html>
        <head>
          <title>CivicAI - Request #${req.id}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.5; color: #1e293b; padding: 40px; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-weight: 800; color: #4f46e5; font-size: 24px; }
            h1 { font-size: 20px; color: #0f172a; margin: 0; }
            h2 { font-size: 16px; color: #475569; margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            .section { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .priority-high { color: #dc2626; font-weight: 700; }
            .priority-medium { color: #d97706; font-weight: 700; }
            .priority-low { color: #16a34a; font-weight: 700; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CivicAI</div>
            <div>Official Citizen Request Summary</div>
          </div>
          
          <div class="section">
            <h2>General Information</h2>
            <div class="grid">
              <div><strong>Request ID:</strong> #${req.id}</div>
              <div><strong>Status:</strong> ${req.status}</div>
              <div><strong>Received:</strong> ${req.createdAt.toLocaleString()}</div>
            </div>
            <p><strong>Subject:</strong><br/>${req.subject}</p>
          </div>

          ${classificationHtml}

          <div class="footer">
            Digital Governance Framework • Digital Services Emulator
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handlePrint(req)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Print Service Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>

                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleClassify(req.id, req.subject)}
                          disabled={isProcessing === req.id}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                        >
                          {isProcessing === req.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              Sorting...
                            </>
                          ) : 'Run Smart Sort'}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-green-600 flex items-center justify-end">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Processed
                        </span>
                      )}
                    </div>
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
