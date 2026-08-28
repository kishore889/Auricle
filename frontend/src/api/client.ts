// =============================================================================
// AURICLE — Centralized API Client
//
// All domain API services must use this client.
// Components must NOT create arbitrary fetch() implementations independently.
//
// Backend URL is read exclusively from VITE_API_BASE_URL environment variable.
// No backend addresses are hard-coded in source.
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
console.log("AURICLE API BASE URL:", API_BASE_URL);

if (!API_BASE_URL) {
  console.warn(
    '[AuricleAPI] VITE_API_BASE_URL is not set. ' +
    'API requests will fail until a backend URL is configured in .env'
  );
}

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/**
 * Expected backend error shape.
 * { "error": { "code": "...", "message": "...", "details": null } }
 */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: unknown | null;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown | null;

  constructor(status: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to reach the AURICLE backend. Check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

// ---------------------------------------------------------------------------
// Request Options
// ---------------------------------------------------------------------------

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Access token to include in Authorization header */
  accessToken?: string | null;
  /** Base URL override (defaults to VITE_API_BASE_URL) */
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function parseErrorBody(response: Response): Promise<ApiError> {
  try {
    const json = (await response.json()) as Partial<ApiErrorBody>;
    const err = json?.error;
    return new ApiError(
      response.status,
      err?.code ?? `HTTP_${response.status}`,
      err?.message ?? response.statusText,
      err?.details ?? null
    );
  } catch {
    return new ApiError(response.status, `HTTP_${response.status}`, response.statusText);
  }
}

/**
 * Core typed fetch wrapper.
 *
 * Throws:
 *   - NetworkError  — fetch itself failed (no network / CORS / timeout)
 *   - ApiError      — backend returned a non-2xx status
 *
 * Returns the parsed JSON body typed as T.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, accessToken, baseUrl, ...rest } = options;

  const base = (baseUrl ?? API_BASE_URL ?? '').replace(/\/$/, '');
  const url = `${base}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(rest.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      credentials: 'include', // Send HttpOnly session cookie for refresh
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new NetworkError(
      err instanceof Error ? err.message : 'Network request failed'
    );
  }

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Convenience helpers — typed per HTTP method
// ---------------------------------------------------------------------------

export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'POST', body });
}

export function apiPut<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'PUT', body });
}

export function apiPatch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'PATCH', body });
}

export function apiDelete<T>(path: string, options?: RequestOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'DELETE' });
}
