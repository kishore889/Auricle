import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  Smartphone,
  Volume2,
  Bell,
  FlaskConical,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuthStore } from '../stores/authStore';
import { mockDeviceSummary } from '../mocks/device.mock';
import { cn } from '../lib/utils';

export default function SettingsPage(): React.ReactElement {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'profile' | 'device' | 'audio' | 'notifications' | 'research' | 'privacy'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName ?? 'Auricle User');
  const [email] = useState(user?.email ?? 'user@auricle.dev');

  // Device
  const [deviceName, setDeviceName] = useState(mockDeviceSummary.name);
  const [syncInterval, setSyncInterval] = useState('100');

  // Audio
  const [processingGain, setProcessingGain] = useState('100');
  const [enableEnhancement, setEnableEnhancement] = useState(true);

  // Notifications
  const [envAlerts, setEnvAlerts] = useState(true);
  const [deviceAlerts, setDeviceAlerts] = useState(true);

  // Research Mode
  const [researchModeActive, setResearchModeActive] = useState(true);
  const [strategy, setStrategy] = useState('cis_inspired');

  // Privacy
  const [anonymousTelemetry, setAnonymousTelemetry] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Settings & Preferences"
        description="Configure your profile, device preferences, audio processing settings, notification controls, research parameters, and privacy."
        icon={Settings}
        badgeText="App Configuration"
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/6 pb-3 overflow-x-auto select-none scrollbar-none">
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'device', label: 'Device', icon: Smartphone },
          { id: 'audio', label: 'Audio', icon: Volume2 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'research', label: 'Research Mode', icon: FlaskConical },
          { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 border',
                activeTab === tab.id
                  ? 'bg-[#2F80ED] text-white border-[#2F80ED] shadow-md shadow-[#2F80ED]/20'
                  : 'bg-[#132238] border-white/6 text-[#94A3B8] hover:text-[#E8EEF8]'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl select-none">
        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8] border-b border-white/6 pb-3">
              User Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1.5 font-medium">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-[#E8EEF8] focus:outline-none focus:border-[#2F80ED]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1.5 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/6 rounded-xl text-[#94A3B8] cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Device */}
        {activeTab === 'device' && (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8] border-b border-white/6 pb-3">
              Device & Connectivity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1.5 font-medium">Device Name</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-[#E8EEF8] focus:outline-none focus:border-[#2F80ED]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1.5 font-medium">Sync Refresh Interval</label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-[#E8EEF8] focus:outline-none"
                >
                  <option value="50">50 ms (Fastest)</option>
                  <option value="100">100 ms (Recommended)</option>
                  <option value="250">250 ms</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Audio */}
        {activeTab === 'audio' && (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8] border-b border-white/6 pb-3">
              Audio & Sound Processing
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1.5 font-medium">Input Gain Level</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={processingGain}
                    onChange={(e) => setProcessingGain(e.target.value)}
                    className="w-full accent-[#2F80ED] bg-black/20 rounded-lg cursor-pointer"
                  />
                  <span className="text-[#2F80ED] font-mono font-semibold w-12 text-right">{processingGain}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/6">
                <div>
                  <span className="text-[#E8EEF8] font-semibold block">AI Speech Enhancement</span>
                  <span className="text-[#94A3B8] text-xs">Reduce ambient background noise</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableEnhancement}
                  onChange={(e) => setEnableEnhancement(e.target.checked)}
                  className="w-4 h-4 accent-[#2F80ED] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8] border-b border-white/6 pb-3">
              Notification Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/6">
                <span className="text-[#E8EEF8]">Environmental Sound Alerts (Horns, Sirens, Alarms)</span>
                <input
                  type="checkbox"
                  checked={envAlerts}
                  onChange={(e) => setEnvAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#2F80ED] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/6">
                <span className="text-[#E8EEF8]">Device Connectivity Alerts</span>
                <input
                  type="checkbox"
                  checked={deviceAlerts}
                  onChange={(e) => setDeviceAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#2F80ED] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Research Mode */}
        {activeTab === 'research' && (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8] border-b border-white/6 pb-3">
              Research & Simulation Controls
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/6">
                <div>
                  <span className="text-[#E8EEF8] font-semibold block">Enable Research Navigation Section</span>
                  <span className="text-[#94A3B8]">Show Channel Mapping, AI Insights & Activity Logs in navigation</span>
                </div>
                <input
                  type="checkbox"
                  checked={researchModeActive}
                  onChange={(e) => setResearchModeActive(e.target.checked)}
                  className="w-4 h-4 accent-[#2F80ED] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1.5 font-medium">Default Mapping Algorithm</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-[#E8EEF8] focus:outline-none"
                >
                  <option value="cis_inspired">CIS-Inspired Research Strategy</option>
                  <option value="ace_inspired">ACE-Inspired Research Strategy</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Privacy */}
        {activeTab === 'privacy' && (
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8] border-b border-white/6 pb-3">
              Privacy & Telemetry Data
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/6">
                <div>
                  <span className="text-[#E8EEF8] font-semibold block">Share Anonymous Audio Telemetry</span>
                  <span className="text-[#94A3B8]">Help improve Auricle AI classification models</span>
                </div>
                <input
                  type="checkbox"
                  checked={anonymousTelemetry}
                  onChange={(e) => setAnonymousTelemetry(e.target.checked)}
                  className="w-4 h-4 accent-[#2F80ED] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-xs font-semibold transition-all shadow-md shadow-[#2F80ED]/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>

          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#16A34A] font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
