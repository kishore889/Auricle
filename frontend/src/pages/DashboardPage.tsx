import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  MessageSquare,
  Bell,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { SoundMeter } from '../components/dashboard/SoundMeter';
import { EnvironmentCard } from '../components/dashboard/EnvironmentCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockCurrentDetection } from '../mocks/detections.mock';
import { mockCurrentSpeech } from '../mocks/speech.mock';
import { mockAIInsights } from '../mocks/ai.mock';
import { mockAlerts } from '../mocks/alerts.mock';
import { mockLogs } from '../mocks/logs.mock';
import { useAuthStore } from '../stores/authStore';
import { formatTimestamp } from '../lib/utils';

export default function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const latestInsight = mockAIInsights[0];

  const userName = user?.displayName ?? 'Auricle User';

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Welcome Hero Banner */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-xs font-medium text-[#16A34A]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auricle Active · Monitoring Environment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#E8EEF8]">
              Welcome back, {userName}
            </h1>
            <p className="text-sm text-[#94A3B8] max-w-xl leading-relaxed">
              Your surroundings are calm. Speech activity and key environmental sounds are being analyzed in real time.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/live-audio')}
              className="px-4 py-2.5 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#2F80ED]/20"
            >
              <Radio className="w-4 h-4" />
              <span>Live Hearing</span>
            </button>
            <button
              onClick={() => navigate('/sound-analysis')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#E8EEF8] text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#2F80ED]" />
              <span>View Environment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Live Sound Level Meter & Current Classified Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Sound Level Gauge */}
        <SoundMeter
          signalLevel={0.42}
          signalDb={-7.5}
          currentSound="Speech Detected (91% confidence)"
        />

        {/* Current Classified Environment Card */}
        <EnvironmentCard
          category={mockCurrentDetection.category}
          confidence={mockCurrentDetection.confidence}
          priority={mockCurrentDetection.priority}
          timestamp={mockCurrentDetection.timestamp}
          isSafetyEvent={mockCurrentDetection.isSafetyEvent}
        />
      </div>

      {/* Grid Row 2: Speech Understanding Summary & Latest AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speech Understanding Summary Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">Speech Summary</h3>
                <p className="text-xs text-[#94A3B8]">Real-time voice comprehension</p>
              </div>
            </div>
            <StatusBadge
              status={mockCurrentSpeech.speechDetected ? 'Speech Active' : 'No Speech'}
              variant={mockCurrentSpeech.speechDetected ? 'success' : 'neutral'}
            />
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-semibold text-[#E8EEF8] font-mono">
              {Math.round(mockCurrentSpeech.confidence * 100)}% Confidence
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              "{mockCurrentSpeech.transcriptionPlaceholder ?? 'Speech pattern detected in surroundings.'}"
            </p>
          </div>

          <div className="pt-3 border-t border-white/6 flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Active Language: <strong className="text-[#E8EEF8]">English (US)</strong></span>
            <button
              onClick={() => navigate('/speech-understanding')}
              className="text-[#2F80ED] hover:underline font-medium flex items-center gap-1"
            >
              <span>Full Transcript</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Insight Summary Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">AI Intelligence Insight</h3>
                <p className="text-xs text-[#94A3B8]">Smart audio pattern analysis</p>
              </div>
            </div>
            <StatusBadge status={latestInsight.priority} size="sm" />
          </div>

          <p className="text-xs text-[#E8EEF8] leading-relaxed">
            {latestInsight.summary}
          </p>

          <div className="pt-3 border-t border-white/6 flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Context: <strong className="text-[#E8EEF8]">{latestInsight.environmentalContext}</strong></span>
            <button
              onClick={() => navigate('/ai-insights')}
              className="text-[#2F80ED] hover:underline font-medium flex items-center gap-1"
            >
              <span>All Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 3: Recent Alerts Feed & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts Feed */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm font-semibold text-[#E8EEF8]">Important Notifications</h3>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs text-[#2F80ED] hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {mockAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-black/20 border border-white/6 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-[#E8EEF8]">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span>{alert.message}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">Automatic safety classification triggered.</p>
                </div>
                <span className="text-[11px] font-mono text-[#94A3B8]/60 shrink-0">
                  {formatTimestamp(alert.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#2F80ED]" />
              <h3 className="text-sm font-semibold text-[#E8EEF8]">Recent Activity</h3>
            </div>
            <button
              onClick={() => navigate('/system-logs')}
              className="text-xs text-[#2F80ED] hover:underline font-medium"
            >
              Activity Logs
            </button>
          </div>

          <div className="space-y-3">
            {mockLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-black/20 border border-white/6 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-[#E8EEF8]">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>{log.event}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">{log.message}</p>
                </div>

                <span className="text-[11px] font-mono text-[#94A3B8]/60 shrink-0">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
