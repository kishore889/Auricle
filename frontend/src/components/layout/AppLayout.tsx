import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExpiredSessionModal } from '../auth/ExpiredSessionModal';
import { useAuthStore } from '../../stores/authStore';

export function AppLayout(): React.ReactElement {
  const authStatus = useAuthStore((s) => s.authStatus);
  const [sessionModalDismissed, setSessionModalDismissed] = useState(false);

  const isExpired = authStatus === 'expired' && !sessionModalDismissed;

  return (
    <div className="h-screen w-screen bg-[#07111F] flex overflow-hidden text-[#E8EEF8] font-sans antialiased select-none">
      {/* Sonner Toast Provider */}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#132238',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#E8EEF8',
            borderRadius: '1rem',
          },
        }}
      />

      {/* Expired Session Overlay */}
      <ExpiredSessionModal
        open={isExpired}
        onDismiss={() => setSessionModalDismissed(true)}
      />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#07111F]">
        {/* Global Navigation Header */}
        <Header />

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#07111F]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
