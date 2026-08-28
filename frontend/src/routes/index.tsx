import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import LiveAudioPage from '../pages/LiveAudioPage';
import SoundAnalysisPage from '../pages/SoundAnalysisPage';
import SpeechUnderstandingPage from '../pages/SpeechUnderstandingPage';
import DeviceStatusPage from '../pages/DeviceStatusPage';
import ChannelSimulationPage from '../pages/ChannelSimulationPage';
import AIInsightsPage from '../pages/AIInsightsPage';
import HistoryPage from '../pages/HistoryPage';
import AlertsPage from '../pages/AlertsPage';
import SystemLogsPage from '../pages/SystemLogsPage';
import SettingsPage from '../pages/SettingsPage';
import AboutPage from '../pages/AboutPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'live-audio', element: <LiveAudioPage /> },
          { path: 'sound-analysis', element: <SoundAnalysisPage /> },
          { path: 'speech-understanding', element: <SpeechUnderstandingPage /> },
          { path: 'device-status', element: <DeviceStatusPage /> },
          { path: 'channel-simulation', element: <ChannelSimulationPage /> },
          { path: 'ai-insights', element: <AIInsightsPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'alerts', element: <AlertsPage /> },
          { path: 'system-logs', element: <SystemLogsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'about', element: <AboutPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
