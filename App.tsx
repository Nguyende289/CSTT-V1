import React, { useEffect, useState } from 'react';
import { fetchSheetData } from './services/sheetService';
import { initializeChat } from './services/geminiService';
import { SheetData, LoadingState } from './types';
import { DataTable } from './components/DataTable';
import { ChatWidget } from './components/ChatWidget';
import { LayoutDashboard, MessageSquareText, RefreshCw, AlertCircle, FileSpreadsheet, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<SheetData>({ columns: [], rows: [] });
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'chat'>('data');
  const [sheetId, setSheetId] = useState('1xC0djt7frAxbvnk4C6KZ_yffYrU605TXrkg6VNbCWC8');
  const [sheetName, setSheetName] = useState('Vụ việc');
  const [showSettings, setShowSettings] = useState(false);

  const loadData = async () => {
    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    try {
      const sheetData = await fetchSheetData(sheetId, sheetName);
      setData(sheetData);
      
      // Initialize Gemini with the new data
      try {
          initializeChat(sheetData);
      } catch (e) {
          console.warn("Could not initialize AI chat immediately:", e);
      }

      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      setLoadingState(LoadingState.ERROR);
      setErrorMsg(err.message || 'Đã xảy ra lỗi không xác định khi tải dữ liệu.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update logic when settings change
  const handleSettingsSave = () => {
      setShowSettings(false);
      loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  Theo Dõi Vụ Việc
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">Xem & Phân Tích Dữ Liệu Google Sheet</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Cài đặt"
                >
                    <Settings className="h-5 w-5" />
                </button>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Mở Google Sheet ↗
                </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Settings Modal (Inline for simplicity) */}
      {showSettings && (
          <div className="bg-slate-100 border-b border-slate-200 p-4">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Mã Google Sheet (ID)</label>
                      <input 
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                        className="w-full text-sm border-slate-300 rounded-md p-2"
                        placeholder="Nhập ID trang tính..."
                      />
                  </div>
                   <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tên Sheet (Sheet Name)</label>
                      <input 
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        className="w-full text-sm border-slate-300 rounded-md p-2"
                        placeholder="Ví dụ: Vụ việc"
                      />
                  </div>
                  <button 
                    onClick={handleSettingsSave}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Tải lại dữ liệu
                  </button>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* State: Loading */}
        {loadingState === LoadingState.LOADING && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu từ Google Sheets...</p>
          </div>
        )}

        {/* State: Error */}
        {loadingState === LoadingState.ERROR && (
          <div className="flex flex-col items-center justify-center h-64 max-w-lg mx-auto text-center space-y-4 p-6 bg-red-50 rounded-2xl border border-red-100">
            <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-900">Kết nối thất bại</h3>
            <p className="text-red-700">{errorMsg}</p>
            <div className="text-sm text-red-600/80 bg-white/50 p-3 rounded-lg text-left">
                <strong>Hướng dẫn khắc phục:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Đảm bảo Google Sheet đã được <strong>Xuất bản lên web (Publish to web)</strong> (Tệp {'>'} Chia sẻ {'>'} Xuất bản lên web).</li>
                    <li>Kiểm tra tên Sheet "Vụ việc" có chính xác không (chữ hoa/thường, dấu cách).</li>
                    <li>Kiểm tra ID của Google Sheet.</li>
                </ul>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* State: Success */}
        {loadingState === LoadingState.SUCCESS && (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            
            {/* Mobile Tabs */}
            <div className="lg:hidden flex mb-4 bg-slate-200 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'data' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                    Dữ Liệu
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                    Trợ Lý AI
                </button>
            </div>

            {/* Left Panel: Data Table */}
            <div className={`flex-1 h-full min-h-0 ${activeTab === 'chat' ? 'hidden lg:block' : 'block'}`}>
              <DataTable data={data} />
            </div>

            {/* Right Panel: Gemini Chat */}
            <div className={`w-full lg:w-96 h-full min-h-0 flex-shrink-0 ${activeTab === 'data' ? 'hidden lg:block' : 'block'}`}>
               <ChatWidget />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;