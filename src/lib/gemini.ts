import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const model = "gemini-3-flash-preview";

export async function generateSOP(studentData: any) {
  const prompt = `Generate a professional Statement of Purpose (SOP) for a student with the following details:
  Name: ${studentData.name}
  Academic Marks: Math ${studentData.math}%, Physics ${studentData.physics}%, Chemistry ${studentData.chemistry}%
  Selected Course: ${studentData.course}
  Interests: ${studentData.interests || 'Technology, Science, Innovation'}
  
  The SOP should be around 300 words, formal, and highlight why the student is a good fit for the course.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function recommendCourses(marks: any, interests: string) {
  const prompt = `Based on the following academic performance and interests, suggest 3 best-fit university courses:
  Marks: Math ${marks.math}%, Physics ${marks.physics}%, Chemistry ${marks.chemistry}%
  Interests: ${interests}
  
  Return the suggestions in JSON format with 'courseName' and 'reason'.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            courseName: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function performOCR(base64Image: string, mimeType: string) {
  const prompt = "Extract all relevant information from this academic certificate/marksheet. Include Name, Subject Marks, Date of Issue, and Institution Name.";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: base64Image, mimeType } }
      ]
    }
  });

  return response.text;
}

export async function detectFraud(formData: any, ocrText: string) {
  const prompt = `Compare the following form data with the extracted OCR text from the document. 
  Identify any mismatches in names, marks, or dates. 
  Assign a fraud score from 0 to 100 (0 being highly suspicious, 100 being perfectly authentic).
  
  Form Data: ${JSON.stringify(formData)}
  OCR Text: ${ocrText}
  
  Return JSON with 'fraudScore', 'mismatches' (array of strings), and 'isAuthentic' (boolean).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fraudScore: { type: Type.NUMBER },
          mismatches: { type: Type.ARRAY, items: { type: Type.STRING } },
          isAuthentic: { type: Type.BOOLEAN }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getFinalDecision(profile: any) {
  const prompt = `Evaluate the following student profile for admission:
  Profile: ${JSON.stringify(profile)}
  
  Consider academic performance, fraud score, and SOP quality.
  Return JSON with 'decision' (Approved/Rejected), 'recommendation' (Approve/Reject), and 'feedback' (string).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          decision: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          feedback: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function chatWithAssistant(message: string, history: any[] = []) {
  const chat = ai.chats.create({
    model,
    history: history,
    config: {
      systemInstruction: "You are a helpful AI Admission Assistant for MeritMatrix AI. Help students with their application, document requirements, and course queries."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
