import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockAlerts } from '../mocks/alerts.mock';
import type { Alert, AlertStatus, AlertSeverity } from '../types';
import { formatTimestamp, cn } from '../lib/utils';

export default function AlertsPage(): React.ReactElement {
  const [alertsState, setAlertsState] = useState<Alert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState<AlertStatus | 'all' | 'critical'>('all');

  const handleAcknowledge = (id: string) => {
    setAlertsState((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged', acknowledgedAt: new Date().toISOString() } : a
      )
    );
  };

  const handleResolve = (id: string) => {
    setAlertsState((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a
      )
    );
  };

  const filteredAlerts = alertsState.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return a.severity === 'critical';
    return a.status === activeTab;
  });

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-[#DC2626]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      default:
        return <Info className="w-5 h-5 text-[#2F80ED]" />;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Alerts & Incident Management"
        description="Real-time environmental safety notifications, device connectivity alerts, and system status incidents."
        icon={Bell}
        badgeText={`${alertsState.filter((a) => a.status === 'active').length} Active`}
        lastUpdated={formatTimestamp('2024-01-15T08:00:00Z')}
      />

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 select-none">
        {(['all', 'active', 'critical', 'acknowledged', 'resolved'] as const).map((tab) => {
          const count =
            tab === 'all'
              ? alertsState.length
              : tab === 'critical'
                ? alertsState.filter((a) => a.severity === 'critical').length
                : alertsState.filter((a) => a.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border',
                activeTab === tab
                  ? 'bg-[#2F80ED] text-white border-[#2F80ED] shadow-md shadow-[#2F80ED]/20'
                  : 'bg-[#132238] border-white/6 text-[#94A3B8] hover:text-[#E8EEF8]'
              )}
            >
              <span className="capitalize">{tab}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px] text-[#E8EEF8]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Alert Cards */}
      <div className="space-y-4 select-none">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-8 text-center text-[#94A3B8] text-xs">
            No alerts matching the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'bg-[#132238] border rounded-2xl p-6 shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4',
                alert.severity === 'critical' ? 'border-[#DC2626]/30 bg-[#DC2626]/5' : 'border-white/6'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-black/20 border border-white/6 shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="text-xs font-mono font-semibold text-[#2F80ED] uppercase">
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#94A3B8]/60 font-mono">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#E8EEF8]">{alert.message}</h3>

                  <p className="text-xs text-[#94A3B8]">
                    Source Subsystem: <strong className="text-[#E8EEF8] font-mono">{alert.source}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                {alert.status === 'active' && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-4 py-2 rounded-xl bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/20 text-xs font-semibold transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'resolved' ? (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-[#16A34A]/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-semibold border border-[#16A34A]/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
