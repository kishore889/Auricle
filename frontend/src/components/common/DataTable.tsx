import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  filterControls?: React.ReactNode;
  exportFilename?: string;
  defaultPageSize?: number;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no items matching your criteria.',
  searchPlaceholder = 'Search records…',
  filterControls,
  exportFilename = 'auricle-export.csv',
  defaultPageSize = 10,
  className,
}: DataTableProps<T>): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const searchedData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortKey) return searchedData;

    const col = columns.find((c) => c.key === sortKey);
    return [...searchedData].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (col?.sortValue) {
        valA = col.sortValue(a);
        valB = col.sortValue(b);
      } else {
        valA = String(a[sortKey] ?? '');
        valB = String(b[sortKey] ?? '');
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchedData, sortKey, sortOrder, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortKey === colKey) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else setSortKey(null);
    } else {
      setSortKey(colKey);
      setSortOrder('asc');
    }
  };

  const handleExportCsv = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = c.sortValue ? c.sortValue(row) : row[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 select-none shadow-lg', className)}>
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/6 pb-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-1.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#2F80ED] transition-colors"
            />
          </div>

          {filterControls}
        </div>

        {/* CSV Export */}
        <button
          onClick={handleExportCsv}
          disabled={data.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-[#E8EEF8] text-xs font-medium border border-white/10 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#2F80ED]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingState skeletonRows={5} />
      ) : paginatedData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/6 text-[#94A3B8] text-[11px] font-medium">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={cn(
                      'py-3 px-3 font-semibold',
                      col.sortable !== false && 'cursor-pointer hover:text-[#E8EEF8] transition-colors',
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-[#94A3B8]/60">
                          {sortKey === col.key ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#2F80ED]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#2F80ED]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {paginatedData.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-white/5 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('py-3 px-3', col.className)}>
                      {col.accessor
                        ? col.accessor(row)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && sortedData.length > 0 && (
        <div className="pt-4 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div>
            Showing <span className="text-[#E8EEF8] font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-[#E8EEF8] font-semibold">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="text-[#E8EEF8] font-semibold">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-[#E8EEF8] focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#E8EEF8] transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-[#E8EEF8]">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#E8EEF8] transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
