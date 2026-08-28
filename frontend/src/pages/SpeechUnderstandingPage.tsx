import React from 'react';
import { MessageSquare, Mic, Globe, Smile, Tag, Target, Clock, FileText } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockCurrentSpeech, mockSpeechHistory } from '../mocks/speech.mock';
import { formatConfidence, formatTimestamp } from '../lib/utils';

export default function SpeechUnderstandingPage(): React.ReactElement {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Speech Intelligence & Transcript"
        description="Real-time voice comprehension, Speech-to-Text transcription, language identification, intent detection, and tone analysis."
        icon={MessageSquare}
        badgeText="Voice Processing Active"
        lastUpdated={formatTimestamp(mockCurrentSpeech.timestamp)}
      />

      {/* Grid Row 1: Key Speech NLP Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2.5 text-[#2F80ED]">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold text-[#E8EEF8]">Language Detected</span>
          </div>
          <div className="text-xl font-semibold text-[#E8EEF8]">English (US)</div>
          <span className="text-xs font-mono text-[#16A34A]">99% Match Confidence</span>
        </div>

        {/* Audio Confidence */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2.5 text-[#16A34A]">
            <Mic className="w-4 h-4" />
            <span className="text-xs font-semibold text-[#E8EEF8]">Voice Confidence</span>
          </div>
          <div className="text-xl font-semibold font-mono text-[#E8EEF8]">
            {formatConfidence(mockCurrentSpeech.confidence)}
          </div>
          <span className="text-xs text-[#94A3B8]">High Speech Clarity</span>
        </div>

        {/* Intent Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2.5 text-[#F59E0B]">
            <Target className="w-4 h-4" />
            <span className="text-xs font-semibold text-[#E8EEF8]">Primary Intent</span>
          </div>
          <div className="text-xl font-semibold text-[#E8EEF8]">Informative Query</div>
          <span className="text-xs text-[#94A3B8]">Conversation context</span>
        </div>

        {/* Emotional Tone Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2.5 text-[#2F80ED]">
            <Smile className="w-4 h-4" />
            <span className="text-xs font-semibold text-[#E8EEF8]">Emotional Tone</span>
          </div>
          <div className="text-xl font-semibold text-[#E8EEF8]">Calm / Direct</div>
          <span className="text-xs text-[#16A34A]">Positive Acoustic Pitch</span>
        </div>
      </div>

      {/* Main Live Transcript & Keywords Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Transcript Box */}
        <div className="lg:col-span-2 bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">Live Speech Transcript</h3>
                <p className="text-xs text-[#94A3B8]">Real-time Speech-to-Text stream</p>
              </div>
            </div>
            <StatusBadge
              status={mockCurrentSpeech.speechDetected ? 'Listening' : 'Silent'}
              variant={mockCurrentSpeech.speechDetected ? 'success' : 'neutral'}
            />
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/6 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-medium text-[#E8EEF8]">Active Speaker 1</span>
              <span className="font-mono text-[#94A3B8]/60">Live · {mockCurrentSpeech.durationMs ?? 850}ms</span>
            </div>
            <p className="text-base text-[#E8EEF8] leading-relaxed font-sans font-medium">
              "{mockCurrentSpeech.transcriptionPlaceholder ?? 'Speech detected in environment — Processing audio stream.'}"
            </p>
          </div>

          {/* Keywords List */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2 font-medium">
              <Tag className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span>Extracted Keywords & Key Phrases:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-xs text-[#2F80ED] font-medium">
                Auricle Device
              </span>
              <span className="px-3 py-1 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-xs text-[#2F80ED] font-medium">
                Sound Perception
              </span>
              <span className="px-3 py-1 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-xs text-[#2F80ED] font-medium">
                Cochlear Processing
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#94A3B8]">
                Acoustic Signal
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#94A3B8]">
                Noise Suppression
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Speech Segmentation Timeline */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-semibold text-[#E8EEF8]">Speech Timeline</h3>

          <div className="relative border-l-2 border-[#2F80ED]/30 pl-4 space-y-4 text-xs">
            <div className="relative">
              <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span className="font-medium text-[#E8EEF8] block">Active Speech Burst</span>
              <span className="text-[#94A3B8] text-[11px] block mt-0.5">850 ms • 91% Voice Match</span>
            </div>

            <div className="relative">
              <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
              <span className="font-medium text-[#94A3B8] block">Brief Pause</span>
              <span className="text-[#94A3B8]/60 text-[11px] block mt-0.5">Ambient noise floor</span>
            </div>

            <div className="relative">
              <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span className="font-medium text-[#E8EEF8] block">Sentence Segment</span>
              <span className="text-[#94A3B8] text-[11px] block mt-0.5">2100 ms • Formant Enhanced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speech Log History Table */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#2F80ED]" />
            <h3 className="text-sm font-semibold text-[#E8EEF8]">Transcript History Log</h3>
          </div>
          <span className="text-xs text-[#94A3B8]">Recorded Voice Segments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/6 text-[#94A3B8] text-[11px] font-medium">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right font-mono">Confidence</th>
                <th className="py-3 px-4 text-right font-mono">Duration</th>
                <th className="py-3 px-4 text-center">Processing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {mockSpeechHistory.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">{formatTimestamp(s.timestamp)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={s.speechDetected ? 'Speech' : 'Silent'}
                      variant={s.speechDetected ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#2F80ED]">
                    {formatConfidence(s.confidence)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#E8EEF8]">
                    {s.durationMs ? `${s.durationMs} ms` : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[#16A34A] font-medium">{s.processingState}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
