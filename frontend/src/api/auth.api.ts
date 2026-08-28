import { apiGet, apiPost } from './client';
import type { User } from '../types';

// ---------------------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
  institution?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// ---------------------------------------------------------------------------
// Auth API Service
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/login
 * Returns a short-lived access token (held in memory) and sets HttpOnly refresh cookie.
 */
export function authLogin(data: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', data);
}

/**
 * POST /api/auth/refresh
 * Uses the HttpOnly session cookie (sent automatically via credentials: 'include').
 */
export function authRefresh(): Promise<RefreshResponse> {
  return apiPost<RefreshResponse>('/auth/refresh');
}

/**
 * POST /api/auth/logout
 * Clears session on backend; frontend should clear in-memory token.
 */
export function authLogout(): Promise<void> {
  return apiPost<void>('/auth/logout');
}

/**
 * POST /api/auth/register
 * Creates a new local user account.
 */
export function authRegister(data: RegisterRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/register', data)
}

/**
 * POST /api/auth/google
 * Verifies a Google ID token server-side and returns an Auricle session.
 */
export function authGoogle(credential: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/google', { credential });
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user.
 */
export function authMe(accessToken: string): Promise<User> {
  return apiGet<User>('/auth/me', { accessToken });
}
