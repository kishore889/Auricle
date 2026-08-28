import type { User } from '../types';
import type { LoginRequest, LoginResponse, RefreshResponse } from '../api/auth.api';

// ---------------------------------------------------------------------------
// AURICLE — Controlled Frontend Authentication Service
// ---------------------------------------------------------------------------

const MOCK_USER: User = {
  id: 'user-auricle-001',
  email: 'user@auricle.dev',
  username: 'auricleuser',
  displayName: 'Auricle User',
  role: 'researcher',
  createdAt: '2024-01-15T08:00:00Z',
  lastLoginAt: new Date().toISOString(),
};

/**
 * Simulates POST /api/auth/login
 */
export async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  // Simulate network latency (300ms)
  await new Promise((r) => setTimeout(r, 300));

  if (!data.email || !data.password) {
    throw new Error('Please enter your email and password.');
  }

  const nameFromEmail = data.email.includes('@')
    ? data.email.split('@')[0].replace('.', ' ')
    : data.email;

  const displayName = nameFromEmail
    ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
    : 'Auricle User';

  const user: User = {
    ...MOCK_USER,
    email: data.email,
    username: nameFromEmail,
    displayName: displayName,
  };

  return {
    accessToken: `mock-access-token-${Date.now()}`,
    user,
    expiresIn: 3600,
  };
}

export async function mockRefresh(): Promise<RefreshResponse> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    accessToken: `mock-access-token-refreshed-${Date.now()}`,
    expiresIn: 3600,
  };
}

export async function mockLogout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
}

export async function mockMe(token: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 200));
  if (!token || token.includes('invalid')) {
    throw new Error('Unauthorized or expired session');
  }
  return MOCK_USER;
}
