import { create } from 'zustand';

// ---------------------------------------------------------------------------
// UI Store — Layout and navigation UI state only.
// Do NOT store server state here; use TanStack Query for that.
// ---------------------------------------------------------------------------

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeDevice: string | null;
  currentPageTitle: string;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setActiveDevice: (deviceId: string | null) => void;
  setCurrentPageTitle: (title: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  activeDevice: null,
  currentPageTitle: 'Dashboard',

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  setActiveDevice: (activeDevice) => set({ activeDevice }),
  setCurrentPageTitle: (currentPageTitle) => set({ currentPageTitle }),
}));
