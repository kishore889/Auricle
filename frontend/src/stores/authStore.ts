import { create } from 'zustand';
import type { User, AuthStatus } from '../types';

// ---------------------------------------------------------------------------
// Auth Store
//
// Access tokens are held in memory only — never localStorage.
// Refresh/session token is managed by the backend via HttpOnly cookie.
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  /** Short-lived access token held in memory only */
  accessToken: string | null;
  authenticated: boolean;
  authStatus: AuthStatus;

  // Actions
  setAuthenticated: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setAuthStatus: (status: AuthStatus) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  authenticated: false,
  authStatus: 'idle',

  setAuthenticated: (user, accessToken) =>
    set({
      user,
      accessToken,
      authenticated: true,
      authStatus: 'authenticated',
    }),

  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),

  setAuthStatus: (authStatus) => set({ authStatus }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      authenticated: false,
      authStatus: 'unauthenticated',
    }),
}));
