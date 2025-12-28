
import React, { useState } from 'react';
import { classifyQuery } from '../services/geminiService';
import { ServiceRequest } from '../types';
import { translations } from '../translations';

interface Props {
  language: string;
}

const AdminDashboard: React.FC<Props> = ({ language }) => {
  const t = translations[language];
  const [requests, setRequests] = useState<ServiceRequest[]>([
    { id: '1', subject: 'Inquiry about child benefit eligibility', status: 'Pending', createdAt: new Date() },
    { id: '2', subject: 'URGENT: Water pipe burst near main square', status: 'Pending', createdAt: new Date() }
  ]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleClassify = async (id: string, subject: string) => {
    setIsProcessing(id);
    try {
      const classification = await classifyQuery(subject, language);
      setRequests(prev => prev.map(req => req.id === id ? { ...req, classification, status: 'Processed' } : req));
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl">
        <h2 className="text-3xl font-bold mb-2">{t.adminTitle}</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
            <tr>
              <th className="px-6 py-4">Request</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 text-sm font-bold">{req.subject}</td>
                <td className="px-6 py-4 text-xs">
                  {req.status === 'Processed' ? <span className="text-green-600 font-bold">Processed</span> : 'Pending'}
                </td>
                <td className="px-6 py-4 text-right">
                  {req.status === 'Pending' && (
                    <button onClick={() => handleClassify(req.id, req.subject)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
                      {isProcessing === req.id ? t.loading : 'Classify'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
