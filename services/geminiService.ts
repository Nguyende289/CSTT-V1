import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SheetData } from "../types";

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const initializeChat = (data: SheetData) => {
  const client = getClient();
  
  // Create a context summary. If data is too large, we might truncate it.
  // For this demo, we'll try to convert the rows to a JSON string.
  // We limit to the first 100 rows to avoid token limits if the sheet is huge.
  const dataSummary = JSON.stringify(data.rows.slice(0, 100));
  const totalRows = data.rows.length;
  const columns = data.columns.map(c => c.label).join(', ');

  const systemInstruction = `
    You are an expert Data Analyst named "Gemini Analyst".
    You are analyzing a dataset from a Google Sheet titled "Vụ việc" (Cases/Incidents).
    
    Dataset Metadata:
    - Total Rows: ${totalRows} (Note: Only the first 100 rows are provided in context for detailed analysis if the dataset is large).
    - Columns: ${columns}
    
    Current Data Sample (JSON):
    ${dataSummary}
    
    Your goal is to answer user questions based STRICTLY on this data.
    - If the user asks for a summary, analyze the provided rows.
    - If the user asks for specific details, search the provided JSON.
    - If the answer is not in the data, state that you cannot find it in the provided sample.
    - Format your answers nicely using Markdown (lists, bold text, etc.).
    - Be concise and professional.
    - IMPORTANT: ALWAYS RESPOND IN VIETNAMESE (Tiếng Việt).
  `;

  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please load data first.");
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: message
    });
    return result.text || "Không có phản hồi được tạo ra.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.";
  }
};