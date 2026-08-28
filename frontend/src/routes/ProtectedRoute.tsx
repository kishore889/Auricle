import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * ProtectedRoute — Redirects to /login if not authenticated.
 * Phase 0: uses mock auth state from authStore.
 * Phase 1+: will validate against real session.
 */
export function ProtectedRoute(): React.ReactElement {
  const authenticated = useAuthStore((s) => s.authenticated);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
