// =============================================================================
// AURICLE — Centralized WebSocket Service
//
// Singleton service. All components subscribe here; none create raw WebSocket
// connections independently.
//
// WS URL is read exclusively from VITE_WS_BASE_URL environment variable.
// No backend addresses are hard-coded in source.
//
// Reconnect policy: exponential backoff 1s → 2s → 4s → 8s → 16s → max 30s
// Reconnect is suppressed after an intentional disconnect/logout.
// =============================================================================

import type { RealtimeMessage, WebSocketMessageType } from '../types';
import type { ConnectionStatus } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL as string | undefined;

if (!WS_BASE_URL) {
  console.warn(
    '[AuricleWS] VITE_WS_BASE_URL is not set. ' +
      'WebSocket will not connect until configured in .env'
  );
}

// ---------------------------------------------------------------------------
// Backoff Configuration
// ---------------------------------------------------------------------------

const BACKOFF_INITIAL_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
const STABLE_CONNECTION_MS = 5_000; // reset backoff after this long connected

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MessageHandler = (message: RealtimeMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;
type AnyHandler = MessageHandler | StatusHandler;

interface Subscription<T extends AnyHandler> {
  id: string;
  handler: T;
}

// ---------------------------------------------------------------------------
// WebSocket Service Class
// ---------------------------------------------------------------------------

class AuricleWebSocketService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private intentionalDisconnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stableTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = BACKOFF_INITIAL_MS;
  private accessToken: string | null = null;
  private wsPath = '/ws';

  // Subscriptions by message type
  private messageSubscriptions = new Map<
    WebSocketMessageType | 'all',
    Subscription<MessageHandler>[]
  >();

  // Status subscriptions
  private statusSubscriptions: Subscription<StatusHandler>[] = [];

  private idCounter = 0;

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Connect to the AURICLE WebSocket endpoint.
   * @param path  WS path (default: '/ws')
   * @param token Access token to send in query string
   */
  connect(path = '/ws', token?: string): void {
    this.intentionalDisconnect = false;
    this.wsPath = path;
    this.accessToken = token ?? null;
    this.openSocket();
  }

  /**
   * Intentionally disconnect. Suppresses reconnect.
   */
  disconnect(): void {
    this.intentionalDisconnect = true;
    this.clearReconnectTimer();
    this.clearStableTimer();
    this.socket?.close(1000, 'Intentional disconnect');
    this.socket = null;
    this.setStatus('disconnected');
    this.backoffMs = BACKOFF_INITIAL_MS;
  }

  /**
   * Subscribe to a specific message type (or 'all').
   * @returns Unsubscribe function
   */
  subscribe(
    type: WebSocketMessageType | 'all',
    handler: MessageHandler
  ): () => void {
    const id = String(++this.idCounter);
    const sub: Subscription<MessageHandler> = { id, handler };
    const existing = this.messageSubscriptions.get(type) ?? [];
    this.messageSubscriptions.set(type, [...existing, sub]);
    return () => this.unsubscribeMessage(type, id);
  }

  /**
   * Subscribe to WebSocket connection status changes.
   * @returns Unsubscribe function
   */
  onStatusChange(handler: StatusHandler): () => void {
    const id = String(++this.idCounter);
    this.statusSubscriptions = [...this.statusSubscriptions, { id, handler }];
    // Emit current status immediately
    handler(this.status);
    return () => {
      this.statusSubscriptions = this.statusSubscriptions.filter((s) => s.id !== id);
    };
  }

  /**
   * Current connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Update the access token used in the WS URL query string.
   * Triggers reconnect if currently connected.
   */
  setAccessToken(token: string | null): void {
    const changed = this.accessToken !== token;
    this.accessToken = token;
    if (changed && this.status === 'connected') {
      this.disconnect();
      this.intentionalDisconnect = false;
      this.openSocket();
    }
  }

  // ---------------------------------------------------------------------------
  // Internal — Connection Lifecycle
  // ---------------------------------------------------------------------------

  private openSocket(): void {
    if (this.socket && this.socket.readyState < WebSocket.CLOSING) {
      return; // Already open/opening
    }

    if (!WS_BASE_URL) {
      this.setStatus('error');
      return;
    }

    const base = WS_BASE_URL.replace(/\/$/, '');
    const tokenParam = this.accessToken
      ? `?token=${encodeURIComponent(this.accessToken)}`
      : '';
    const url = `${base}${this.wsPath}${tokenParam}`;

    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(url);
    } catch {
      this.setStatus('error');
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = this.handleOpen;
    this.socket.onmessage = this.handleMessage;
    this.socket.onclose = this.handleClose;
    this.socket.onerror = this.handleError;
  }

  private handleOpen = (): void => {
    this.setStatus('connected');
    this.clearReconnectTimer();

    // Reset backoff after stable connection
    this.stableTimer = setTimeout(() => {
      this.backoffMs = BACKOFF_INITIAL_MS;
    }, STABLE_CONNECTION_MS);
  };

  private handleMessage = (event: MessageEvent): void => {
    let message: RealtimeMessage;
    try {
      message = JSON.parse(event.data as string) as RealtimeMessage;
    } catch {
      console.warn('[AuricleWS] Failed to parse message:', event.data);
      return;
    }

    // Dispatch to type-specific subscribers
    const typeSubscribers = this.messageSubscriptions.get(message.type) ?? [];
    const allSubscribers = this.messageSubscriptions.get('all') ?? [];

    for (const sub of [...typeSubscribers, ...allSubscribers]) {
      try {
        sub.handler(message);
      } catch (err) {
        console.error('[AuricleWS] Error in message handler:', err);
      }
    }
  };

  private handleClose = (_event: CloseEvent): void => {
    this.clearStableTimer();
    this.socket = null;

    if (this.intentionalDisconnect) {
      this.setStatus('disconnected');
      return;
    }

    const wasConnected = this.status === 'connected';
    this.setStatus(wasConnected ? 'reconnecting' : 'error');
    this.scheduleReconnect();
  };

  private handleError = (_event: Event): void => {
    // onclose will fire after onerror; let handleClose manage the reconnect
    console.warn('[AuricleWS] WebSocket error');
  };

  // ---------------------------------------------------------------------------
  // Internal — Reconnect
  // ---------------------------------------------------------------------------

  private scheduleReconnect(): void {
    if (this.intentionalDisconnect) return;
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      if (!this.intentionalDisconnect) {
        this.setStatus('reconnecting');
        this.openSocket();
      }
      // Advance backoff
      this.backoffMs = Math.min(this.backoffMs * 2, BACKOFF_MAX_MS);
    }, this.backoffMs);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearStableTimer(): void {
    if (this.stableTimer !== null) {
      clearTimeout(this.stableTimer);
      this.stableTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal — Status
  // ---------------------------------------------------------------------------

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    for (const sub of this.statusSubscriptions) {
      try {
        sub.handler(status);
      } catch (err) {
        console.error('[AuricleWS] Error in status handler:', err);
      }
    }
  }

  private unsubscribeMessage(type: WebSocketMessageType | 'all', id: string): void {
    const subs = this.messageSubscriptions.get(type) ?? [];
    this.messageSubscriptions.set(
      type,
      subs.filter((s) => s.id !== id)
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

/**
 * AURICLE singleton WebSocket service.
 * Import and use this everywhere — do not create new WebSocket() directly.
 */
export const wsService = new AuricleWebSocketService();
