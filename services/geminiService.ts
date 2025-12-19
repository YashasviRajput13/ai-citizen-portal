
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult, FormAnalysis, ServiceDetailInfo } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const askAssistant = async (query: string, history: {role: 'user' | 'assistant', content: string}[]) => {
  const ai = getAI();
  const systemInstruction = `
    You are the CivicAI Digital Assistant. 
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

export const fetchServiceInfo = async (serviceName: string): Promise<ServiceDetailInfo> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed profile for the digital government service category: "${serviceName}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          aiInsight: { type: Type.STRING },
          processingTime: { type: Type.STRING }
        },
        required: ["summary", "features", "steps", "aiInsight", "processingTime"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
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

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: "Transcribe all the text from this government form image. Provide only the extracted text without any preamble or summary."
        }
      ]
    }
  });

  return response.text || "";
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
