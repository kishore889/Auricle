import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Activity, Building, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { authLogin, authRegister, authGoogle } from '../api/auth.api';
import { ApiError, NetworkError } from '../api/client';

// ── Google Identity Services type declarations ──────────────────────────────
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme?: string;
            size?: string;
            width?: number;
            text?: string;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function mapApiError(err: unknown): string {
  if (err instanceof NetworkError) {
    return 'Cannot reach the AURICLE server. Make sure the backend is running.';
  }
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'AUTH_INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'AUTH_EMAIL_TAKEN':
        return 'An account with this email already exists. Sign in instead.';
      case 'AUTH_GOOGLE_NOT_CONFIGURED':
        return 'Google Sign-In is not configured on this server.';
      case 'AUTH_GOOGLE_INVALID_TOKEN':
        return 'Google authentication failed. Please try again.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      default:
        return err.message || 'Authentication failed.';
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // ── Google Identity Services initialization ────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      cancel_on_tap_outside: true,
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 400,
        text: 'continue_with',
      });
    }
  }, []);

  const handleGoogleCredential = async (response: { credential: string }) => {
    setError('');
    setLoading(true);
    try {
      const result = await authGoogle(response.credential);
      setAuthenticated(result.user, result.accessToken);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await authLogin({ email, password });
        setAuthenticated(result.user, result.accessToken);
      } else {
        const result = await authRegister({
          full_name: name,
          email,
          password,
          password_confirm: passwordConfirm,
          institution: institution || undefined,
        });
        setAuthenticated(result.user, result.accessToken);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#E8EEF8] flex select-none overflow-hidden">
      {/* Left Column: Visual Showcase & Brand Intro */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D1728] border-r border-white/6 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-2xl bg-[#2F80ED]/15 border border-[#2F80ED]/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#2F80ED]" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-wider block leading-none">AURICLE</span>
            <span className="text-xs text-[#94A3B8] mt-1 block">AI Hearing Assistant</span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-xs text-[#2F80ED] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Next-Generation Auditory Intelligence</span>
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-[#E8EEF8]">
            Calm, intelligent sound comprehension for everyday life.
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Auricle combines bio-inspired cochlear processing with advanced AI sound recognition to enhance real-world communication and environmental awareness.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="bg-[#132238] border border-white/6 p-4 rounded-2xl">
              <div className="text-xl font-bold font-mono text-[#2F80ED]">22 Ch</div>
              <div className="text-xs text-[#94A3B8] mt-1">Cochlear Simulation</div>
            </div>
            <div className="bg-[#132238] border border-white/6 p-4 rounded-2xl">
              <div className="text-xl font-bold font-mono text-[#16A34A]">&lt; 30ms</div>
              <div className="text-xs text-[#94A3B8] mt-1">Real-Time Processing</div>
            </div>
          </div>
        </div>

        {/* Bottom Research Footer */}
        <div className="z-10 pt-6 border-t border-white/6 text-xs text-[#94A3B8] flex items-center justify-between">
          <span>Auricle Health-Tech Platform</span>
          <span>Privacy &amp; Security Compliant</span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-[#2F80ED]/15 border border-[#2F80ED]/30 items-center justify-center text-[#2F80ED]">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">AURICLE</h2>
            <p className="text-xs text-[#94A3B8]">AI Hearing Assistant</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-[#0D1728] p-1 rounded-2xl border border-white/6 flex">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'login' ? 'bg-[#2F80ED] text-white shadow-md' : 'text-[#94A3B8] hover:text-[#E8EEF8]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signup' ? 'bg-[#2F80ED] text-white shadow-md' : 'text-[#94A3B8] hover:text-[#E8EEF8]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Authentication Form Box */}
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#E8EEF8]">
                {mode === 'login' ? 'Welcome back' : 'Get started with Auricle'}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {mode === 'login' ? 'Sign in to access your hearing dashboard' : 'Enter your details to register a new account'}
              </p>
            </div>

            {/* Google OAuth Button */}
            {GOOGLE_CLIENT_ID ? (
              /* Rendered by Google GIS SDK */
              <div ref={googleBtnRef} className="w-full" />
            ) : (
              /* Show disabled state when not configured */
              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-xs font-medium text-[#94A3B8] flex items-center justify-center gap-2 transition-colors cursor-not-allowed relative group"
                title="Set VITE_GOOGLE_CLIENT_ID in .env to enable Google Sign-In"
              >
                <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8c0 2.8.7 5.1 1.9 7.5l3.7-3c-.2-.7-.4-1.4-.4-2.3z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span>Continue with Google</span>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1E3A5F] text-[10px] text-[#94A3B8] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Requires VITE_GOOGLE_CLIENT_ID in .env
                </span>
              </button>
            )}

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-[10px] uppercase font-mono text-[#94A3B8]/60">Or continue with email</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2F80ED] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@auricle.dev"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2F80ED] transition-colors"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Institution / Organization (Optional)</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="University or Clinical Lab"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2F80ED] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2F80ED] transition-colors"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-xs text-[#E8EEF8] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2F80ED] transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94A3B8]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-black/30 border-white/10 text-[#2F80ED] focus:ring-0"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-xs text-[#2F80ED] hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs text-[#DC2626]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#2F80ED] hover:bg-[#2F80ED]/90 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#2F80ED]/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Please wait…</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Auricle' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Privacy & Academic Disclaimer */}
          <p className="text-[11px] text-[#94A3B8]/70 text-center leading-relaxed max-w-sm mx-auto">
            Auricle is an AI-assisted research prototype. Your audio processing and telemetry data are managed according to strict privacy standards.
          </p>
        </div>
      </div>
    </div>
  );
}
