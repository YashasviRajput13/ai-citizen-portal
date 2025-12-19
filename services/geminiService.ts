
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult, FormAnalysis } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const askAssistant = async (query: string, history: {role: 'user' | 'assistant', content: string}[]) => {
  const ai = getAI();
  const systemInstruction = `
    You are the CivicAI Digital Assistant, inspired by Estonia's e-Governance. 
    Your goal is to help citizens understand government services (scholarships, permits, taxes, IDs) in simple, human terms.
    - Avoid complex legal jargon.
    - If you don't know a specific local law, provide general guidance and suggest where to find official links.
    - Be empathetic and professional.
    - Format your responses using Markdown for clarity.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
        ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user' as any, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text;
};

export const analyzeForm = async (formText: string): Promise<FormAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following government form text and explain it simply: \n\n${formText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          purpose: { type: Type.STRING },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          deadlines: { type: Type.STRING },
          commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
          simplifiedExplanation: { type: Type.STRING },
        },
        required: ["purpose", "requirements", "deadlines", "commonMistakes", "simplifiedExplanation"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const classifyQuery = async (query: string): Promise<ClassificationResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Classify the following citizen request for administrative routing: \n\n"${query}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          department: { type: Type.STRING },
          urgencyReason: { type: Type.STRING }
        },
        required: ["category", "priority", "department", "urgencyReason"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
