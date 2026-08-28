import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Radio,
  Compass,
  MessageSquare,
  Smartphone,
  Layers,
  Sparkles,
  History,
  Bell,
  Activity,
  HelpCircle,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Home',            path: '/dashboard',            icon: Home },
  { name: 'Live Hearing',    path: '/live-audio',           icon: Radio },
  { name: 'Environment',     path: '/sound-analysis',       icon: Compass },
  { name: 'Speech',          path: '/speech-understanding', icon: MessageSquare },
  { name: 'Device',          path: '/device-status',        icon: Smartphone },
  { name: 'Channel Mapping', path: '/channel-simulation',   icon: Layers },
  { name: 'AI Insights',     path: '/ai-insights',          icon: Sparkles },
  { name: 'History',         path: '/history',              icon: History },
  { name: 'Alerts',          path: '/alerts',               icon: Bell },
  { name: 'Activity Logs',   path: '/system-logs',          icon: Activity },
  { name: 'Help & About',    path: '/about',                icon: HelpCircle },
];
