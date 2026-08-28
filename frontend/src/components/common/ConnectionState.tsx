import React from 'react';
import type { ConnectionStatus } from '../../types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../../lib/utils';

interface ConnectionStateProps {
  label: string;
  status: ConnectionStatus;
  detail?: string;
  className?: string;
}

/**
 * ConnectionState — Compact connectivity card for telemetry endpoints.
 */
export function ConnectionState({
  label,
  status,
  detail,
  className,
}: ConnectionStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs',
        className
      )}
    >
      <div className="flex flex-col">
        <span className="font-medium text-gray-300">{label}</span>
        {detail && <span className="text-[10px] text-gray-500 font-mono mt-0.5">{detail}</span>}
      </div>

      <StatusBadge status={status} size="sm" />
    </div>
  );
}
