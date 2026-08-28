import React, { useState } from 'react';
import { Activity, Filter } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockLogs } from '../mocks/logs.mock';
import type { SystemLog } from '../types';
import { formatTimestamp } from '../lib/utils';

export default function SystemLogsPage(): React.ReactElement {
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filteredLogs = mockLogs.filter((log) => {
    const matchComponent = componentFilter === 'all' || log.component === componentFilter;
    const matchLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchComponent && matchLevel;
  });

  const columns: Column<SystemLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: (row) => <span className="font-mono text-[#94A3B8]">{formatTimestamp(row.timestamp)}</span>,
      sortable: true,
    },
    {
      key: 'level',
      header: 'Severity Level',
      accessor: (row) => <StatusBadge status={row.level} size="sm" />,
      sortable: true,
    },
    {
      key: 'component',
      header: 'System Component',
      accessor: (row) => (
        <span className="font-mono text-xs text-[#2F80ED] font-semibold uppercase">
          {row.component.replace(/_/g, ' ')}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'event',
      header: 'Event Activity',
      accessor: (row) => <span className="font-semibold text-[#E8EEF8]">{row.event}</span>,
      sortable: true,
    },
    {
      key: 'message',
      header: 'Activity Details',
      accessor: (row) => <span className="text-[#94A3B8] text-xs">{row.message}</span>,
      sortable: false,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortable: true,
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Activity & System Logs"
        description="Comprehensive audit timeline log across hardware connections, audio analysis, AI inference, and user actions."
        icon={Activity}
        badgeText="Live Activity Log"
        lastUpdated={formatTimestamp('2024-01-15T08:00:00Z')}
      />

      {/* Shared DataTable View */}
      <DataTable
        data={filteredLogs as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        keyExtractor={(row) => (row as unknown as SystemLog).id}
        searchPlaceholder="Search activity logs, events, components, or details…"
        exportFilename="auricle-activity-logs-export.csv"
        filterControls={
          <div className="flex items-center gap-3">
            {/* Component Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#E8EEF8] focus:outline-none"
              >
                <option value="all">All Components</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="ai_engine">AI Engine</option>
                <option value="dsp_engine">DSP Engine</option>
                <option value="mems_microphone">MEMS Mic</option>
                <option value="esp32">ESP32</option>
                <option value="serial_communication">Serial</option>
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#E8EEF8] focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
