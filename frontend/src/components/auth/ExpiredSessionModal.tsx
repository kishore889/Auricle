import React from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ExpiredSessionModalProps {
  open: boolean;
  onDismiss?: () => void;
}

/**
 * ExpiredSessionModal — Displays when the session token expires or is rejected.
 */
export function ExpiredSessionModal({
  open,
  onDismiss,
}: ExpiredSessionModalProps): React.ReactElement | null {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  if (!open) return null;

  const handleReauthenticate = () => {
    clearAuth();
    if (onDismiss) onDismiss();
    navigate('/login', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-warning-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--color-warning-light)',
              border: '1px solid var(--color-warning-border)',
              color: 'var(--color-warning)',
            }}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Session expired
            </h3>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Your session has expired. Please sign in again to continue using Auricle.
            </p>
          </div>
        </div>

        <div
          className="mt-6 pt-4 border-t flex items-center justify-end"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={handleReauthenticate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)')}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign in again
          </button>
        </div>
      </div>
    </div>
  );
}
