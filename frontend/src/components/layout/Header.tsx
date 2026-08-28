import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  User as UserIcon,
  Bell,
  ChevronDown,
  Settings,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { useDeviceStore } from '../../stores/deviceStore';
import { NAVIGATION_ITEMS } from './navigation';

export function Header(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const toggleMobileSidebar = useUiStore((s) => s.toggleMobileSidebar);

  const esp32Status = useDeviceStore((s) => s.esp32Status);
  const microphoneStatus = useDeviceStore((s) => s.microphoneStatus);

  // Dropdown states
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentNavItem = NAVIGATION_ITEMS.find((item) => item.path === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.name : 'Home';

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const isConnected = esp32Status === 'connected' || microphoneStatus === 'connected' || true; // Demo active

  return (
    <header className="bg-[#07111F]/90 backdrop-blur-md border-b border-white/6 shrink-0 select-none z-30 sticky top-0">
      <div className="h-14 px-6 flex items-center justify-between gap-4">
        {/* Left: Navigation Drawer Toggle + Current Route Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-[#E8EEF8] tracking-tight">{pageTitle}</h1>
        </div>

        {/* Right: Device status indicator + Notifications + User Menu */}
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-xs font-medium text-[#16A34A]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>{isConnected ? 'System Connected' : 'Connecting'}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#E8EEF8] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2F80ED]" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#132238] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-100">
                <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between bg-black/20">
                  <span className="text-xs font-semibold text-[#E8EEF8]">Notifications</span>
                  <span className="text-[10px] font-mono text-[#2F80ED] bg-[#2F80ED]/10 px-2 py-0.5 rounded-full border border-[#2F80ED]/20">
                    2 New
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-white/6">
                  <div className="p-3 text-xs hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-[#F59E0B] font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Environmental Sound Alert
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Vehicle horn detected nearby.</p>
                    <span className="text-[10px] font-mono text-[#94A3B8]/60 mt-1 block">2 mins ago</span>
                  </div>

                  <div className="p-3 text-xs hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-[#16A34A] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Device Synchronized
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Auricle hardware is active.</p>
                    <span className="text-[10px] font-mono text-[#94A3B8]/60 mt-1 block">15 mins ago</span>
                  </div>
                </div>

                <div className="p-2.5 border-t border-white/6 bg-black/20 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/alerts');
                    }}
                    className="text-[11px] text-[#2F80ED] hover:underline font-medium"
                  >
                    View All Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative border-l border-white/6 pl-3">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#2F80ED] text-white flex items-center justify-center font-semibold text-xs shadow-md shadow-[#2F80ED]/20">
                {user?.displayName ? user.displayName.charAt(0) : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-[#E8EEF8] leading-none">
                  {user?.displayName ?? 'Auricle User'}
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-0.5 leading-tight">
                  {user?.email ?? 'user@auricle.dev'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden md:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-[#132238] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-100"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="p-2.5 border-b border-white/6 mb-1">
                  <div className="text-xs font-semibold text-[#E8EEF8]">{user?.displayName ?? 'Auricle User'}</div>
                  <div className="text-[11px] text-[#94A3B8] truncate">{user?.email ?? 'user@auricle.dev'}</div>
                </div>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#E8EEF8] hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-[#2F80ED]" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
