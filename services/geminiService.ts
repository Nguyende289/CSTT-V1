import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SheetData } from "../types";

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    // An toàn: Kiểm tra biến môi trường một cách an toàn cho cả môi trường Node và Browser
    let apiKey = '';
    try {
        // Ưu tiên Vite env nếu có
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
            apiKey = import.meta.env.VITE_API_KEY;
        } 
        // Fallback sang process.env (cần kiểm tra typeof process để tránh crash)
        else if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            apiKey = process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Lỗi khi đọc biến môi trường:", e);
    }
    
    if (!apiKey) {
        console.warn("Cảnh báo: Chưa cấu hình API_KEY. Tính năng chat sẽ không hoạt động.");
        // Khởi tạo với key giả để không crash ứng dụng
        aiClient = new GoogleGenAI({ apiKey: 'MISSING_API_KEY' });
    } else {
        aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
};

export const initializeChat = (data: SheetData) => {
  try {
    const client = getClient();
    
    // Create a context summary.
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
  } catch (error) {
    console.error("Lỗi khởi tạo Chat AI:", error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    if (!aiClient || (aiClient as any).apiKey === 'MISSING_API_KEY') {
        return "Lỗi cấu hình: Thiếu API Key. Vui lòng kiểm tra biến môi trường (VITE_API_KEY hoặc API_KEY).";
    }
    return "Phiên chat chưa sẵn sàng. Vui lòng đợi dữ liệu tải xong.";
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: message
    });
    return result.text || "Không có phản hồi được tạo ra.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && error.message.includes('API key not valid')) {
        return "Lỗi: API Key không hợp lệ hoặc đã hết hạn.";
    }
    return "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại.";
  }
};