import { QueryClient } from '@tanstack/react-query';

/**
 * AURICLE — TanStack Query Client
 *
 * Configured with sensible defaults for the research prototype:
 * - retry: 1 — don't hammer a likely-unavailable backend
 * - staleTime: 30s — device/status data is relatively stable
 * - gcTime: 5min — keep inactive data cached
 * - refetchOnWindowFocus: false — telemetry has its own real-time channel (WebSocket)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
