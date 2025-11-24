import { SheetData, SheetColumn, SheetRow } from '../types';

// The ID provided by the user
const DEFAULT_SPREADSHEET_ID = '1xC0djt7frAxbvnk4C6KZ_yffYrU605TXrkg6VNbCWC8';
const DEFAULT_SHEET_NAME = 'Vụ việc';

export const fetchSheetData = async (
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID,
  sheetName: string = DEFAULT_SHEET_NAME
): Promise<SheetData> => {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  try {
    console.log(`Đang tải dữ liệu từ: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Không tìm thấy Sheet (Lỗi 404). Kiểm tra lại ID: ${spreadsheetId}`);
        }
        throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Google Visualization API returns JSON wrapped in a function call
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Phản hồi không hợp lệ từ Google:", text);
      throw new Error('Định dạng dữ liệu không đúng. Hãy chắc chắn Sheet đã "Xuất bản lên web" (File > Share > Publish to web) và tên Sheet chính xác.');
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    let jsonData;
    try {
        jsonData = JSON.parse(jsonString);
    } catch (e) {
        throw new Error('Lỗi phân tích JSON từ Google Sheet. Dữ liệu trả về bị hỏng.');
    }

    if (jsonData.status === 'error') {
       const detail = jsonData.errors?.[0]?.detailed_message || jsonData.errors?.[0]?.message;
       throw new Error(`Google Sheet API báo lỗi: ${detail || 'Lỗi không xác định'}. Kiểm tra lại tên Sheet "${sheetName}".`);
    }

    const table = jsonData.table;
    
    if (!table || !table.cols) {
        throw new Error("Không tìm thấy dữ liệu bảng. Sheet có thể bị trống.");
    }

    // Parse Columns
    const columns: SheetColumn[] = table.cols
      .filter((col: any) => col && col.label) 
      .map((col: any) => ({
        id: col.id,
        label: col.label,
        type: col.type
      }));

    if (columns.length === 0) {
        throw new Error("Không tìm thấy cột dữ liệu nào (Hàng 1 của Sheet phải là tiêu đề cột).");
    }

    // Parse Rows
    const rows: SheetRow[] = table.rows.map((row: any) => {
      const rowData: SheetRow = {};
      // Ensure row.c exists before iterating
      if (row.c) {
          row.c.forEach((cell: any, index: number) => {
            const column = columns[index];
            if (column) {
              let value = cell?.v ?? null;
              if (cell?.f) value = cell.f; // Use formatted value if available
              rowData[column.label] = value;
            }
          });
      }
      return rowData;
    });

    console.log(`Đã tải thành công: ${rows.length} dòng.`);
    return { columns, rows };

  } catch (error) {
    console.error("Chi tiết lỗi fetchSheetData:", error);
    throw error;
  }
};
