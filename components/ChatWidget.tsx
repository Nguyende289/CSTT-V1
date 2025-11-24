import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Xin chào! Tôi đã phân tích dữ liệu "Vụ việc". Tôi có thể giúp gì cho bạn? Bạn có thể yêu cầu tôi tóm tắt danh sách hoặc tìm thông tin cụ thể.' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsThinking(true);

    try {
      const response = await sendMessageToGemini(userMessage);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, tôi gặp sự cố khi kết nối với AI.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-2">
        <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="font-semibold text-slate-800">Trợ Lý Ảo Gemini</h3>
            <p className="text-xs text-slate-500">Hỏi đáp về dữ liệu của bạn</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="h-5 w-5 text-white" />
              ) : (
                <Bot className="h-5 w-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              {msg.role === 'model' ? (
                 <div className="prose prose-sm max-w-none prose-slate">
                     <ReactMarkdown>{msg.text}</ReactMarkdown>
                 </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
             </div>
             <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang phân tích...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder-slate-400"
            placeholder="Đặt câu hỏi về dữ liệu 'Vụ việc'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};