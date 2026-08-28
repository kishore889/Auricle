import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

const FAQ_ITEMS = [
  {
    question: 'What is Auricle?',
    answer:
      'Auricle is an AI-assisted hearing platform that combines bio-inspired cochlear processing with real-time sound recognition to enhance real-world environmental awareness and speech comprehension.',
  },
  {
    question: 'How does environmental sound recognition work?',
    answer:
      'Auricle captures acoustic signals through digital MEMS micro-sensors, processes them through deep learning neural models, and classifies surrounding sound events (such as speech, traffic, horns, sirens, or alarms) in real time.',
  },
  {
    question: 'What is Cochlear-Inspired Channel Mapping?',
    answer:
      'Channel Mapping decomposes incoming audio into 22 frequency bands mimicking the tonotopic organization of human hearing, using algorithms inspired by Continuous Interleaved Sampling (CIS) and Advanced Combination Encoders (ACE).',
  },
  {
    question: 'Can Auricle be used as a clinical medical device?',
    answer:
      'No. Auricle is an academic research prototype. It is designed for laboratory telemetry, AI model evaluation, and software simulation. It is not a clinically approved medical device.',
  },
];

export default function AboutPage(): React.ReactElement {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl select-none">
      {/* Page Header */}
      <PageHeader
        title="Help & About Auricle"
        description="Learn how Auricle works, explore system features, understand the architecture, and find answers to frequently asked questions."
        icon={HelpCircle}
        badgeText="Version 2.4"
      />

      {/* Hero Overview Card */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2F80ED]/15 border border-[#2F80ED]/30 flex items-center justify-center text-[#2F80ED]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#E8EEF8]">About Auricle Platform</h2>
            <p className="text-xs text-[#94A3B8]">AI-Assisted Auditory Intelligence Research</p>
          </div>
        </div>

        <p className="text-sm text-[#94A3B8] leading-relaxed">
          Auricle is designed to transform environmental hearing by bridging real-time acoustic signal processing with AI comprehension. By breaking audio into frequency channels and applying neural noise suppression, Auricle highlights speech clarity while preserving critical awareness of surrounding sounds.
        </p>
      </div>

      {/* Visual Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-3 shadow-lg">
          <div className="p-3 rounded-2xl bg-[#2F80ED]/10 text-[#2F80ED] w-fit">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#E8EEF8]">Speech Comprehension</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Real-time Speech-to-Text transcription, keyword extraction, and acoustic tone analysis to support clearer communication.
          </p>
        </div>

        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-3 shadow-lg">
          <div className="p-3 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#E8EEF8]">Sound Intelligence</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            AI classification of ambient sounds, priority safety alerts for horns or sirens, and confidence scoring.
          </p>
        </div>

        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-3 shadow-lg">
          <div className="p-3 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] w-fit">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#E8EEF8]">Channel Mapping</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            22-channel spectral envelope mapping inspired by bio-inspired CIS/ACE algorithms with physical hardware LED synchronization.
          </p>
        </div>
      </div>

      {/* Architecture Cards Section */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-[#2F80ED]" />
          <h3 className="text-sm font-semibold text-[#E8EEF8]">Simplified System Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
          <div className="p-4 rounded-xl bg-black/20 border border-white/6">
            <span className="text-[#2F80ED] block mb-1 font-bold">Step 1</span>
            <span className="text-[#E8EEF8] block">Acoustic Sound</span>
          </div>
          <div className="p-4 rounded-xl bg-black/20 border border-white/6">
            <span className="text-[#2F80ED] block mb-1 font-bold">Step 2</span>
            <span className="text-[#E8EEF8] block">MEMS Sensor</span>
          </div>
          <div className="p-4 rounded-xl bg-black/20 border border-white/6">
            <span className="text-[#2F80ED] block mb-1 font-bold">Step 3</span>
            <span className="text-[#E8EEF8] block">AI & DSP Processing</span>
          </div>
          <div className="p-4 rounded-xl bg-black/20 border border-white/6">
            <span className="text-[#2F80ED] block mb-1 font-bold">Step 4</span>
            <span className="text-[#E8EEF8] block">Speech & Intent</span>
          </div>
          <div className="p-4 rounded-xl bg-[#2F80ED] text-white font-bold rounded-xl shadow-md">
            <span className="block mb-1">Step 5</span>
            <span className="block">Auricle Interface</span>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
        <h3 className="text-sm font-semibold text-[#E8EEF8]">Frequently Asked Questions</h3>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={faq.question} className="border border-white/6 rounded-xl overflow-hidden bg-black/20">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-[#E8EEF8]"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#2F80ED]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#94A3B8] leading-relaxed border-t border-white/6 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Single Mandatory Research Disclaimer */}
      <div className="p-5 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#E8EEF8] flex items-start gap-3.5 shadow-lg">
        <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-xs text-[#F59E0B] block">Academic Research Notice</span>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Auricle is an academic research prototype. It is designed solely for software telemetry, speech enhancement model evaluation, and simulated channel mapping. It is not a clinically approved medical device.
          </p>
        </div>
      </div>
    </div>
  );
}
