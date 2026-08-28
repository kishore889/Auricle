import React, { useState } from 'react';
import { Compass, ShieldAlert, Filter, Search, Car, AlertTriangle, MessageSquare, Radio } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DetectionCharts } from '../components/analysis/DetectionCharts';
import { mockCurrentDetection, mockDetectionHistory } from '../mocks/detections.mock';
import { soundCategoryLabel, formatConfidence, formatTimestamp } from '../lib/utils';

export default function SoundAnalysisPage(): React.ReactElement {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredDetections = mockDetectionHistory.filter((d) => {
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesSearch =
      d.rawLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'speech':
      case 'human_voice':
        return <MessageSquare className="w-4 h-4 text-[#2F80ED]" />;
      case 'vehicle_horn':
      case 'traffic':
        return <Car className="w-4 h-4 text-[#F59E0B]" />;
      case 'siren':
      case 'alarm':
        return <AlertTriangle className="w-4 h-4 text-[#DC2626]" />;
      default:
        return <Radio className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Environmental Sound Intelligence"
        description="Real-time acoustic pattern recognition, environmental sound detection, and safety alert metrics."
        icon={Compass}
        badgeText="AI Analysis Active"
        lastUpdated={formatTimestamp(mockCurrentDetection.timestamp)}
      />

      {/* Grid Row 1: Key Environment Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Sound Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium block">Current Detected Sound</span>
          <div className="text-xl font-semibold text-[#E8EEF8] capitalize flex items-center gap-2">
            {getCategoryIcon(mockCurrentDetection.category)}
            <span>{soundCategoryLabel(mockCurrentDetection.category)}</span>
          </div>
          <span className="text-xs font-mono text-[#2F80ED] block">
            {formatConfidence(mockCurrentDetection.confidence)} Confidence
          </span>
        </div>

        {/* Intensity Card */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium block">Signal Intensity</span>
          <div className="text-xl font-semibold text-[#E8EEF8] font-mono">
            {Math.round(mockCurrentDetection.intensity * 100)}%
          </div>
          <span className="text-xs text-[#16A34A] block">Normal Ambient Range</span>
        </div>

        {/* Priority Level */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium block">Priority Level</span>
          <div>
            <StatusBadge status={mockCurrentDetection.priority} size="sm" />
          </div>
          <span className="text-xs text-[#94A3B8] block">Standard Monitoring</span>
        </div>

        {/* Category Count */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 shadow-lg space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium block">Sound Categories</span>
          <div className="text-xl font-semibold text-[#E8EEF8] font-mono">7 Categories</div>
          <span className="text-xs text-[#94A3B8] block">Speech, Vehicle, Alarm & More</span>
        </div>
      </div>

      {/* Section 2: Recharts Trend & Distribution Charts */}
      <DetectionCharts detections={mockDetectionHistory} />

      {/* Safety Notice Banner */}
      <div className="p-5 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-xs text-[#E8EEF8] flex items-start gap-3.5 shadow-lg">
        <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold block text-[#F59E0B]">Environmental Awareness Notice</span>
          <p className="text-[#94A3B8] leading-relaxed">
            Important sound detection (horns, sirens, alarms) runs automatically to assist environmental awareness. Always remain aware of your surroundings.
          </p>
        </div>
      </div>

      {/* Section 3: Detection Event Table */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/6 pb-4">
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            Environmental Event History
          </h3>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search events…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#2F80ED]"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#E8EEF8] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="speech">Speech</option>
                <option value="vehicle_horn">Vehicle Horn</option>
                <option value="siren">Siren</option>
                <option value="alarm">Alarm</option>
                <option value="traffic">Traffic</option>
                <option value="human_voice">Human Voice</option>
                <option value="background_noise">Background Noise</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/6 text-[#94A3B8] text-[11px] font-medium">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right font-mono">Confidence</th>
                <th className="py-3 px-4 text-right font-mono">Intensity</th>
                <th className="py-3 px-4 text-center">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filteredDetections.map((det) => (
                <tr key={det.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 font-medium text-[#E8EEF8]">
                      {getCategoryIcon(det.category)}
                      <span className="capitalize">{soundCategoryLabel(det.category)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">{formatTimestamp(det.timestamp)}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#2F80ED]">
                    {formatConfidence(det.confidence)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#16A34A]">
                    {Math.round(det.intensity * 100)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={det.priority} size="sm" />
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
