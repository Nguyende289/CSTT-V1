import { SheetData, SheetColumn, SheetRow } from '../types';

// The ID provided by the user
const DEFAULT_SPREADSHEET_ID = '1xC0djt7frAxbvnk4C6KZ_yffYrU605TXrkg6VNbCWC8';
const DEFAULT_SHEET_NAME = 'Vụ việc';

export const fetchSheetData = async (
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID,
  sheetName: string = DEFAULT_SHEET_NAME
): Promise<SheetData> => {
  // We use the Google Visualization API (gviz) to fetch data as JSON
  // Note: The sheet must be "Published to the web" or at least accessible via link sharing for this to work robustly without OAuth.
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // The response is usually wrapped in "/*O_o*/ google.visualization.Query.setResponse(...);"
    // We need to extract the JSON object.
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Phản hồi từ Google Sheets không hợp lệ hoặc sheet chưa được Công khai (Publish to web).');
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const jsonData = JSON.parse(jsonString);

    if (jsonData.status === 'error') {
       throw new Error(`Lỗi Google Sheet API: ${jsonData.errors?.[0]?.message || 'Lỗi không xác định'}`);
    }

    const table = jsonData.table;
    
    // Parse Columns
    const columns: SheetColumn[] = table.cols
      .filter((col: any) => col.label) // Filter out empty columns often returned by Sheets
      .map((col: any) => ({
        id: col.id,
        label: col.label,
        type: col.type
      }));

    // Parse Rows
    const rows: SheetRow[] = table.rows.map((row: any) => {
      const rowData: SheetRow = {};
      row.c.forEach((cell: any, index: number) => {
        const column = columns[index];
        if (column) {
          // 'v' is the value, 'f' is the formatted value. We prefer formatted if available for display, 
          // but raw value might be better for analysis. Let's use 'v' (value) usually, or 'f' if 'v' is null.
          let value = cell?.v ?? null;
          // Handle specific Google Sheet types
          if (column.type === 'date' || column.type === 'datetime') {
             // Google sheets sends dates as string "Date(year, month, day)"
             // We can just keep the formatted string 'f' if available for simplicity in display
             if (cell?.f) value = cell.f;
          }
          rowData[column.label] = value;
        }
      });
      return rowData;
    });

    return { columns, rows };

  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};