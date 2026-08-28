import React, { useState } from 'react';
import { History, Filter, Download, LayoutGrid, List, Calendar } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockHistory } from '../mocks/history.mock';
import type { HistoryRecord } from '../types';
import { soundCategoryLabel, formatTimestamp, formatConfidence } from '../lib/utils';

export default function HistoryPage(): React.ReactElement {
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredHistory = mockHistory.filter((h) => {
    const matchCategory = categoryFilter === 'all' || h.category === categoryFilter;
    const matchPriority = priorityFilter === 'all' || h.priority === priorityFilter;
    return matchCategory && matchPriority;
  });

  // Group history items by period
  const todayItems = filteredHistory.slice(0, 2);
  const yesterdayItems = filteredHistory.slice(2, 4);
  const thisWeekItems = filteredHistory.slice(4);

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) return;
    const headers = 'Timestamp,Event Type,Category,Confidence,Priority,Summary';
    const rows = filteredHistory.map((h) =>
      `"${h.timestamp}","${h.eventType}","${h.category}","${h.confidence ?? ''}","${h.priority ?? ''}","${h.summary.replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'auricle-history-timeline.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="History & Events Timeline"
        description="Chronological timeline of detected acoustic events, speech activity, environmental alerts, and system sessions."
        icon={History}
        badgeText="Event History"
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/6">
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-[#2F80ED] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#E8EEF8]'
                }`}
                title="Timeline View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#2F80ED] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#E8EEF8]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E8EEF8] text-xs font-medium border border-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Filter Controls Toolbar */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#2F80ED]" />
          <span className="text-xs font-semibold text-[#E8EEF8]">Filter Events:</span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#E8EEF8] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="speech">Speech</option>
            <option value="vehicle_horn">Vehicle Horn</option>
            <option value="system">System</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#E8EEF8] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <span className="text-xs font-mono text-[#94A3B8]">
          Showing {filteredHistory.length} History Events
        </span>
      </div>

      {/* TIMELINE MODE */}
      {viewMode === 'timeline' ? (
        <div className="space-y-8 select-none">
          {/* Today Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2F80ED]">
              <Calendar className="w-4 h-4" />
              <span className="uppercase tracking-wider">Today</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayItems.map((item) => (
                <HistoryTimelineCard key={item.id} record={item} />
              ))}
            </div>
          </div>

          {/* Yesterday Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
              <Calendar className="w-4 h-4" />
              <span className="uppercase tracking-wider">Yesterday</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yesterdayItems.map((item) => (
                <HistoryTimelineCard key={item.id} record={item} />
              ))}
            </div>
          </div>

          {/* This Week Group */}
          {thisWeekItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
                <Calendar className="w-4 h-4" />
                <span className="uppercase tracking-wider">This Week</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {thisWeekItems.map((item) => (
                  <HistoryTimelineCard key={item.id} record={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TABLE MODE */
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 shadow-lg overflow-x-auto select-none">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/6 text-[#94A3B8] text-[11px] font-medium">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right font-mono">Confidence</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">{formatTimestamp(row.timestamp)}</td>
                  <td className="py-3 px-4 font-semibold text-[#2F80ED] uppercase text-[11px]">
                    {row.eventType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 capitalize text-[#E8EEF8]">{soundCategoryLabel(row.category)}</td>
                  <td className="py-3 px-4 text-right font-mono text-[#16A34A]">
                    {row.confidence ? formatConfidence(row.confidence) : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.priority ? <StatusBadge status={row.priority} size="sm" /> : '—'}
                  </td>
                  <td className="py-3 px-4 text-[#94A3B8]">{row.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HistoryTimelineCard({ record }: { record: HistoryRecord }) {
  return (
    <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-[#2F80ED] uppercase tracking-wider font-semibold">
            {record.eventType.replace(/_/g, ' ')}
          </span>
          <h4 className="text-base font-semibold text-[#E8EEF8] capitalize">
            {soundCategoryLabel(record.category)}
          </h4>
        </div>

        {record.priority && <StatusBadge status={record.priority} size="sm" />}
      </div>

      <p className="text-xs text-[#94A3B8] leading-relaxed">{record.summary}</p>

      <div className="pt-3 border-t border-white/6 flex items-center justify-between text-xs text-[#94A3B8]">
        {record.confidence ? (
          <span>Confidence: <strong className="text-[#16A34A] font-mono">{formatConfidence(record.confidence)}</strong></span>
        ) : (
          <span>Event Logged</span>
        )}
        <span className="font-mono text-[#94A3B8]/70">{formatTimestamp(record.timestamp)}</span>
      </div>
    </div>
  );
}
