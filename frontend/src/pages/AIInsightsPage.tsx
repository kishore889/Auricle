import React from 'react';
import {
  Sparkles,
  Activity,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockAIInsights } from '../mocks/ai.mock';
import { formatTimestamp } from '../lib/utils';

const MOCK_TREND_DATA = [
  { time: '10:00', confidence: 85, noiseFloor: 22, speechProb: 78 },
  { time: '10:05', confidence: 92, noiseFloor: 20, speechProb: 88 },
  { time: '10:10', confidence: 78, noiseFloor: 35, speechProb: 45 },
  { time: '10:15', confidence: 96, noiseFloor: 18, speechProb: 94 },
  { time: '10:20', confidence: 88, noiseFloor: 25, speechProb: 82 },
  { time: '10:25', confidence: 94, noiseFloor: 19, speechProb: 90 },
];

export default function AIInsightsPage(): React.ReactElement {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="AI Intelligence & Sound Analytics"
        description="Acoustic pattern trend analysis, noise floor estimation, speech probability analytics, and inference engine performance."
        icon={Sparkles}
        badgeText="Auricle AudioNet Model"
        lastUpdated={formatTimestamp('2024-01-15T08:00:00Z')}
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Inference Latency</span>
            <Cpu className="w-4 h-4 text-[#2F80ED]" />
          </div>
          <div className="text-2xl font-semibold text-[#E8EEF8] font-mono">42 ms</div>
          <span className="text-xs text-[#16A34A] block">Optimal Response (&lt; 50ms)</span>
        </div>

        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Classification Confidence</span>
            <Sparkles className="w-4 h-4 text-[#2F80ED]" />
          </div>
          <div className="text-2xl font-semibold text-[#2F80ED] font-mono">91.4%</div>
          <span className="text-xs text-[#94A3B8] block">Based on 1,420 inferences</span>
        </div>

        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Speech Probability</span>
            <Activity className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-semibold text-[#16A34A] font-mono">88%</div>
          <span className="text-xs text-[#16A34A] block">High Voice Presence</span>
        </div>

        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Noise Floor Estimate</span>
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-semibold text-[#F59E0B] font-mono">-24.5 dB</div>
          <span className="text-xs text-[#94A3B8] block">Quiet Environment</span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            Acoustic Confidence & Speech Trends
          </h3>
          <span className="text-xs font-mono text-[#94A3B8]">Real-Time Trend</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#132238',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  color: '#E8EEF8',
                }}
              />
              <Area type="monotone" dataKey="confidence" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.15} name="Confidence %" />
              <Area type="monotone" dataKey="speechProb" stroke="#16A34A" fill="#16A34A" fillOpacity={0.15} name="Speech Probability %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight Events Feed */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            Recorded AI Engine Insights
          </h3>
          <span className="text-xs text-[#94A3B8]">Classification Stream</span>
        </div>

        <div className="space-y-3">
          {mockAIInsights.map((insight) => (
            <div key={insight.id} className="p-4 rounded-xl bg-black/20 border border-white/6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#2F80ED] font-semibold">{insight.eventType}</span>
                  <span className="text-[#94A3B8]">•</span>
                  <span className="text-[#E8EEF8] font-medium">{insight.environmentalContext}</span>
                </div>

                <StatusBadge status={insight.priority} size="sm" />
              </div>

              <p className="text-xs text-[#E8EEF8] leading-relaxed">{insight.summary}</p>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]/70 pt-1">
                <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                <span>{formatTimestamp(insight.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
