
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult, FormAnalysis, ServiceDetailInfo, RejectionPrediction, GenericFormDraft } from "../types";

// The API key is obtained from the environment variable process.env.API_KEY
const getAIInstance = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY or GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", bn: "Bengali" };
  return names[lang] || "English";
};

export const askAssistant = async (query: string, history: {role: 'user' | 'assistant', content: string}[], lang: string = 'en') => {
  try {
    const ai = getAIInstance();
    const languageName = getLanguageName(lang);
    const systemInstruction = `
    You are the CivicAI Digital Assistant. 
    Your goal is to help citizens understand government services (scholarships, permits, taxes, IDs) in simple, human terms.
    - Respond strictly in ${languageName}.
    - Avoid complex legal jargon.
    - If you don't know a specific local law, provide general guidance and suggest where to find official links.
    - Be empathetic and professional.
    - Format your responses using Markdown for clarity.
    - Use the gemini-3-flash-preview model capabilities for fast, accurate reasoning.
  `;

    const contents = [
      ...history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: query }] }
    ];

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return result.text || "";
  } catch (error) {
    console.error('Error in askAssistant:', error);
    throw error;
  }
};

export const parseGenericDraft = async (conversation: string, lang: string = 'en'): Promise<GenericFormDraft> => {
  try {
    const ai = getAIInstance();
    const languageName = getLanguageName(lang);

    const prompt = `Based on the following conversation, extract and format the user's application details for a generic government form. 
    Detect what document they are drafting (e.g., Passport, License, Certificate) and store it in 'formSubject'. 
    Detect if the type is 'Fresh', 'Renewal', 'Tatkal', 'Duplicate' etc., and store in 'applicationType'. 
    Translate all extracted values into ${languageName}. \n\nConversation:\n${conversation}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const text = result.text;
    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('Error in parseGenericDraft:', error);
    throw error;
  }
};

export const fetchServiceInfo = async (serviceName: string, lang: string = 'en'): Promise<ServiceDetailInfo> => {
  try {
    const ai = getAIInstance();
    const languageName = getLanguageName(lang);

    const prompt = `Generate a detailed profile for the digital government service category: "${serviceName}". Include a specific pre-application checklist for the user to verify their readiness. Respond entirely in ${languageName}.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const text = result.text;
    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('Error in fetchServiceInfo:', error);
    throw error;
  }
};

export const predictRejectionRisk = async (serviceName: string, serviceSummary: string, lang: string = 'en'): Promise<RejectionPrediction> => {
  try {
    const ai = getAIInstance();
    const languageName = getLanguageName(lang);

    const prompt = `Acting as a strict government administrative officer, predict the rejection risk for a standard application to the service: "${serviceName}". 
    The service summary is: "${serviceSummary}".
    Provide a realistic assessment of what causes common rejections for this type of service. Respond entirely in ${languageName}.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const text = result.text;
    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('Error in predictRejectionRisk:', error);
    throw error;
  }
};

export const analyzeForm = async (formText: string, lang: string = 'en'): Promise<FormAnalysis> => {
  try {
    const ai = getAIInstance();
    const languageName = getLanguageName(lang);

    const prompt = `Analyze the following government form text and explain it simply in ${languageName}: \n\n${formText}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const text = result.text;
    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('Error in analyzeForm:', error);
    throw error;
  }
};

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAIInstance();

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Transcribe all the text from this government form image. Provide only the extracted text. This will be used to help a citizen understand the form better." }
        ]
      }]
    });

    return result.text || "";
  } catch (error) {
    console.error('Error in extractTextFromImage:', error);
    throw error;
  }
};

export const classifyQuery = async (query: string, lang: string = 'en'): Promise<ClassificationResult> => {
  try {
    const ai = getAIInstance();
    const languageName = getLanguageName(lang);

    const prompt = `Classify the following citizen request for administrative routing: \n\n"${query}". Respond with values in ${languageName}.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const text = result.text;
    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('Error in classifyQuery:', error);
    throw error;
  }
};
