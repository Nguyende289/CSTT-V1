import React, { useState } from 'react';
import { SheetData, SheetRow } from '../types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface DataTableProps {
  data: SheetData;
}

const ROWS_PER_PAGE = 10;

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const filteredRows = data.rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentRows = filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  if (data.columns.length === 0) {
    return <div className="p-8 text-center text-slate-500">Không có dữ liệu để hiển thị.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800">
          Dữ Liệu Vụ Việc <span className="text-slate-400 text-sm font-normal">({filteredRows.length} mục)</span>
        </h2>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {data.columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {currentRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                {data.columns.map((col) => (
                  <td
                    key={`${rowIndex}-${col.id}`}
                    className="px-6 py-4 text-sm text-slate-700 min-w-[200px] max-w-xl whitespace-normal break-words align-top"
                  >
                    {row[col.label] !== null ? String(row[col.label]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={data.columns.length} className="px-6 py-12 text-center text-slate-500">
                  Không tìm thấy kết quả phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(startIndex + ROWS_PER_PAGE, filteredRows.length)}</span> trong tổng số{' '}
                <span className="font-medium">{filteredRows.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="sr-only">Trước</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="sr-only">Sau</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};