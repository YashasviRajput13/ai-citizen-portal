
export type Tab = 'home' | 'assistant' | 'explainer' | 'admin';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ClassificationResult {
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  department: string;
  urgencyReason: string;
}

export interface FormAnalysis {
  purpose: string;
  requirements: string[];
  deadlines: string;
  commonMistakes: string[];
  simplifiedExplanation: string;
}

export interface ServiceDetailInfo {
  summary: string;
  features: string[];
  steps: string[];
  aiInsight: string;
  processingTime: string;
}

export interface ServiceRequest {
  id: string;
  subject: string;
  classification?: ClassificationResult;
  status: 'Pending' | 'Processed';
  createdAt: Date;
}
