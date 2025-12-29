
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult, FormAnalysis, ServiceDetailInfo, RejectionPrediction, GenericFormDraft, UserProfile } from "../types";

// The API key is obtained from the environment variable process.env.API_KEY
const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", bn: "Bengali" };
  return names[lang] || "English";
};

export const askAssistant = async (query: string, history: {role: 'user' | 'assistant', content: string}[], lang: string = 'en') => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  
  const systemInstruction = `
    You are the CivicAI Official Service Guide. 
    Respond ONLY to government service requests (e.g., birth certificate, passport, permits).
    
    Your responsibilities:
    1. Identify the official government website for the requested service.
    2. Use verified official sources ONLY (prioritize domains like .gov, .gov.in, .nic.in).
    3. If the user's location is missing, briefly ask for it (e.g., "Which state/city are you in?") and STOP. Do not proceed without location for localized services.
    
    Format your response to provide:
    - **Official Application Link** (Direct link to the gov portal)
    - **Required Documents** (Bulleted list)
    - **Application Steps** (Numbered list)
    - **Fees** (If clearly stated on official sources)
    
    Rules:
    - Respond strictly in ${languageName}.
    - Speak clearly and use simple language.
    - Do not guess or add unofficial information.
    - Do not store or repeat personal data.
    - If the request is unclear, ask one short clarification question.
    - If the request is not related to a government service, politely state you can only assist with official government procedures.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
        ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user' as any, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.1,
      tools: [{ googleSearch: {} }] 
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  let links = "";
  if (groundingChunks.length > 0) {
    const urls = Array.from(new Set(groundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => chunk.web!.uri)));
    
    if (urls.length > 0) {
      links = "\n\n**Official Sources:**\n" + urls.map(url => `- [${url}](${url})`).join('\n');
    }
  }

  return response.text + links;
};

export const askProfileAssistant = async (query: string, history: {role: 'user' | 'assistant', content: string}[], lang: string = 'en') => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  
  const systemInstruction = `
    You are an identity profile assistant for CivicAI.
    Your role is to help users create and manage their personal profile for government service applications.

    Rules:
    - Accept user-provided details: Full name, DOB, Gender, Address (state, district), and Aadhaar (masked display).
    - Do not verify or validate identity authenticity.
    - Mask sensitive fields when displaying (e.g., Aadhaar: XXXX-XXXX-1234).
    - If any required information is missing, ask briefly and stop.
    - Explain why details are needed (e.g., "Full name is required for certificate pre-filling").
    - Keep responses clear, minimal, and privacy-focused.
    - Respond strictly in ${languageName}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
        ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user' as any, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  return response.text;
};

export const extractProfileFromImage = async (base64Image: string): Promise<Partial<UserProfile>> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Extract profile details from this identity document (Aadhaar or similar). Return JSON with keys: fullName, dateOfBirth, gender, state, district, aadhaarMasked (show only last 4 digits). If a field is not found, leave it empty." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          dateOfBirth: { type: Type.STRING },
          gender: { type: Type.STRING },
          state: { type: Type.STRING },
          district: { type: Type.STRING },
          aadhaarMasked: { type: Type.STRING }
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {};
  }
};

export const parseGenericDraft = async (conversation: string, lang: string = 'en'): Promise<GenericFormDraft> => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following conversation, extract and format the user's application details for a generic government form. 
    Detect what document they are drafting (e.g., Passport, License, Certificate) and store it in 'formSubject'. 
    Detect if the type is 'Fresh', 'Renewal', 'Tatkal', 'Duplicate' etc., and store in 'applicationType'. 
    Translate all extracted values into ${languageName}. \n\nConversation:\n${conversation}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          formSubject: { type: Type.STRING },
          applicationType: { type: Type.STRING },
          fullName: { type: Type.STRING },
          fatherName: { type: Type.STRING },
          dateOfBirth: { type: Type.STRING },
          address: { type: Type.STRING },
          aiVerificationNote: { type: Type.STRING }
        },
        required: ["formSubject", "applicationType", "fullName", "fatherName", "dateOfBirth", "address", "aiVerificationNote"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const fetchServiceInfo = async (serviceName: string, lang: string = 'en'): Promise<ServiceDetailInfo> => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed profile for the digital government service category: "${serviceName}". Include a specific pre-application checklist for the user to verify their readiness. Respond entirely in ${languageName}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          aiInsight: { type: Type.STRING },
          processingTime: { type: Type.STRING },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "features", "steps", "aiInsight", "processingTime", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const predictRejectionRisk = async (serviceName: string, serviceSummary: string, lang: string = 'en'): Promise<RejectionPrediction> => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Acting as a strict government administrative officer, predict the rejection risk for a standard application to the service: "${serviceName}". 
    The service summary is: "${serviceSummary}".
    Provide a realistic assessment of what causes common rejections for this type of service. Respond entirely in ${languageName}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          approvalProbability: { type: Type.NUMBER },
          riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          mitigationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          aiAnalystNote: { type: Type.STRING }
        },
        required: ["approvalProbability", "riskLevel", "redFlags", "mitigationSteps", "aiAnalystNote"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeForm = async (formText: string, lang: string = 'en'): Promise<FormAnalysis> => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following government form text and explain it simply in ${languageName}: \n\n${formText}`,
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
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Transcribe all the text from this government form image. Provide only the extracted text. This will be used to help a citizen understand the form better." }
      ]
    }
  });
  return response.text || "";
};

export const classifyQuery = async (query: string, lang: string = 'en'): Promise<ClassificationResult> => {
  const ai = getAIInstance();
  const languageName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Classify the following citizen request for administrative routing: \n\n"${query}". Respond with values in ${languageName}.`,
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
