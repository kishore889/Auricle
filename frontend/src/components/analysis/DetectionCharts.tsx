import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import type { SoundDetection } from '../../types';
import { soundCategoryLabel } from '../../lib/utils';

interface DetectionChartsProps {
  detections: SoundDetection[];
}

const CATEGORY_COLORS: Record<string, string> = {
  speech: '#06b6d4', // cyan-500
  vehicle_horn: '#f59e0b', // amber-500
  siren: '#f43f5e', // rose-500
  alarm: '#e11d48', // rose-600
  doorbell: '#3b82f6', // blue-500
  traffic: '#6b7280', // gray-500
  human_voice: '#10b981', // emerald-500
  background_noise: '#4b5563', // gray-600
  other: '#9ca3af',
};

export function DetectionCharts({ detections }: DetectionChartsProps): React.ReactElement {
  // Line chart data (confidence over time)
  const lineData = [...detections].reverse().map((d, index) => ({
    time: `T-${index}`,
    confidence: Math.round(d.confidence * 100),
    category: soundCategoryLabel(d.category),
  }));

  // Bar chart data (category counts)
  const categoryCounts = detections.reduce(
    (acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const barData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: soundCategoryLabel(cat),
    catKey: cat,
    count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
      {/* Chart 1: Confidence Trend Line Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white">Classification Confidence Trend</h3>
          <span className="text-[10px] font-mono text-gray-500">Recharts Telemetry</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#f3f4f6',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => [`${val ?? 0}%`, 'Confidence']}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Frequency Distribution */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white">Sound Category Frequency</h3>
          <span className="text-[10px] font-mono text-gray-500">Class Distribution</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#f3f4f6',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.catKey] ?? '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
