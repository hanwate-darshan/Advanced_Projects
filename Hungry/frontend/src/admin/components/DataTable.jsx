import React from 'react';
import { FaMagnifyingGlass, FaAngleLeft, FaAngleRight, FaInbox } from 'react-icons/fa6';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  filters,
  emptyMessage = 'No records found'
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Top toolbar */}
      {(onSearchChange || actions || filters) && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {onSearchChange && (
              <div className="relative min-w-[220px] max-w-sm flex-1">
                <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            )}
            {filters}
          </div>

          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto min-h-[240px] relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-500">Loading data...</span>
            </div>
          </div>
        ) : null}

        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`px-4 py-3.5 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FaInbox className="text-4xl text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key || col.label}
                      className={`px-4 py-3.5 align-middle ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, idx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-200">{data.length}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <FaAngleLeft />
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
