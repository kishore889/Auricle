import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { NAVIGATION_ITEMS } from './navigation';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export function Sidebar(): React.ReactElement {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:static top-0 left-0 z-50 h-full bg-[#0D1728] border-r border-white/6 flex flex-col transition-all duration-300 ease-in-out select-none',
          sidebarCollapsed ? 'w-16' : 'w-60',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#2F80ED]/15 border border-[#2F80ED]/30 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[#2F80ED]" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-[#E8EEF8] tracking-wider leading-none">
                  AURICLE
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-1 font-medium leading-none truncate">
                  AI Hearing Assistant
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#E8EEF8] transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5 scrollbar-thin">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative',
                    isActive
                      ? 'bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/20'
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#E8EEF8]'
                  )
                }
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        {!sidebarCollapsed && (
          <div className="p-3.5 border-t border-white/6 shrink-0 bg-black/20">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="font-medium">Auricle v2.4</span>
              <span className="inline-flex items-center gap-1 text-[#16A34A] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Active
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
