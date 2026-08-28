// =============================================================================
// AURICLE — Core Domain Types & API Response Contracts (Phase 6 Frozen Contract)
// All domain models and API request/response types used across the application.
// =============================================================================

// ---------------------------------------------------------------------------
// Primitive Enums & Unions
// ---------------------------------------------------------------------------

export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'expired';

export type ProcessingState = 'idle' | 'running' | 'processing' | 'standby' | 'error' | 'stopped';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type SoundCategory =
  | 'speech'
  | 'vehicle_horn'
  | 'siren'
  | 'alarm'
  | 'doorbell'
  | 'traffic'
  | 'human_voice'
  | 'background_noise'
  | 'other';

export type ChannelStrategy = 'cis_inspired' | 'ace_inspired';

export type LogComponent =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'ai_engine'
  | 'dsp_engine'
  | 'mems_microphone'
  | 'esp32'
  | 'serial_communication'
  | 'channel_mapping'
  | 'hardware_visualization';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// ---------------------------------------------------------------------------
// Standardized API Error Contract
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: unknown | null;
  };
}

// ---------------------------------------------------------------------------
// User & Auth Contracts
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'researcher' | 'admin' | 'viewer';
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Session {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  deviceId: string | null;
  label: string | null;
  notes: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  expiresIn: number;
}

export type UserResponse = User;
export type SessionResponse = Session;

// ---------------------------------------------------------------------------
// Device Contracts
// ---------------------------------------------------------------------------

export interface DeviceStatus {
  esp32Connected: boolean;
  esp32Id: string | null;
  esp32LastHeartbeat: string | null;
  microphoneActive: boolean;
  microphoneInputState: 'sampling' | 'idle' | 'error' | 'disconnected';
  microphoneLastUpdate: string | null;
  aiEngineState: ProcessingState;
  dspEngineState: ProcessingState;
  ledArrayActive: boolean;
  ledArrayChannels: number;
  serialCommunicationOk: boolean;
  backendRestStatus: ConnectionStatus;
  backendWsStatus: ConnectionStatus;
  overallHealth: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastUpdated: string;
}

export type DeviceStatusResponse = DeviceStatus;

// ---------------------------------------------------------------------------
// Audio Contracts
// ---------------------------------------------------------------------------

export interface AudioFrame {
  timestamp: number;
  samples: number[];
  sampleRate: number;
  signalLevel: number;
  signalLevelDb: number;
  speechDetected: boolean;
  speechConfidence: number;
  processingState: ProcessingState;
  frameIndex: number;
}

export interface AudioStatus {
  isMonitoring: boolean;
  processingState: ProcessingState;
  sampleRate: number;
  signalLevel: number;
  signalLevelDb: number;
  inputConnected: boolean;
  enhancementActive: boolean;
  latencyMs: number | null;
}

export type AudioStatusResponse = AudioStatus;

// ---------------------------------------------------------------------------
// Sound Detection & Safety Contracts
// ---------------------------------------------------------------------------

export interface SoundDetection {
  id: string;
  timestamp: string;
  category: SoundCategory;
  confidence: number;
  intensity: number;
  priority: Priority;
  rawLabel: string;
  isSafetyEvent: boolean;
}

export interface SafetyEvent {
  id: string;
  timestamp: string;
  category: SoundCategory;
  confidence: number;
  severity: AlertSeverity;
  priority: Priority;
  state: 'active' | 'cleared' | 'acknowledged';
  description: string;
  autoCleared: boolean;
  clearedAt: string | null;
}

export type SoundDetectionResponse = SoundDetection;
export type SafetyEventResponse = SafetyEvent;

// ---------------------------------------------------------------------------
// Speech Understanding Contracts
// ---------------------------------------------------------------------------

export interface SpeechResult {
  id: string;
  timestamp: string;
  speechDetected: boolean;
  confidence: number;
  transcriptionPlaceholder: string | null;
  processingState: ProcessingState;
  durationMs: number | null;
}

export type SpeechResultResponse = SpeechResult;

// ---------------------------------------------------------------------------
// Channel Simulation Contracts
// ---------------------------------------------------------------------------

export interface ChannelActivation {
  channel: number;
  label: string;
  activation: number;
  tLevel: number;
  cLevel: number;
  active: boolean;
}

export interface ChannelProfile {
  id: string;
  name: string;
  strategy: ChannelStrategy;
  totalChannels: number;
  activeChannels: number;
  activations: ChannelActivation[];
  lastUpdated: string;
  sessionId: string | null;
}

export interface ChannelStatus {
  mappingActive: boolean;
  strategy: ChannelStrategy;
  totalChannels: number;
  activeChannels: number;
  ledVisualizationActive: boolean;
  lastUpdated: string;
}

export type ChannelProfileResponse = ChannelProfile;
export type ChannelStatusResponse = ChannelStatus;

// ---------------------------------------------------------------------------
// AI Insights Contracts
// ---------------------------------------------------------------------------

export interface AIInsight {
  id: string;
  timestamp: string;
  eventType: string;
  environmentalContext: string;
  confidence: number;
  priority: Priority;
  soundCategory: SoundCategory | null;
  speechActivity: boolean;
  engineState: ProcessingState;
  summary: string;
}

export type AIInsightResponse = AIInsight;

// ---------------------------------------------------------------------------
// Alerts Contracts
// ---------------------------------------------------------------------------

export type AlertType =
  | 'vehicle_horn'
  | 'siren'
  | 'alarm'
  | 'high_priority_environmental'
  | 'microphone_failure'
  | 'esp32_disconnected'
  | 'hardware_communication_failure'
  | 'backend_failure'
  | 'websocket_failure'
  | 'ai_processing_failure'
  | 'channel_mapping_warning'
  | 'system_info';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  type: AlertType;
  status: AlertStatus;
  message: string;
  source: LogComponent;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  metadata: Record<string, unknown> | null;
}

export type AlertResponse = Alert;

// ---------------------------------------------------------------------------
// System Logs Contracts
// ---------------------------------------------------------------------------

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  component: LogComponent;
  event: string;
  message: string;
  status: 'ok' | 'warning' | 'error' | 'info';
  metadata: Record<string, unknown> | null;
}

export type SystemLogResponse = SystemLog;

// ---------------------------------------------------------------------------
// History Record Contracts
// ---------------------------------------------------------------------------

export interface HistoryRecord {
  id: string;
  timestamp: string;
  eventType: 'sound_detection' | 'safety_event' | 'speech' | 'ai_insight' | 'system';
  category: SoundCategory | 'system';
  confidence: number | null;
  priority: Priority | null;
  deviceId: string | null;
  sessionId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
}

export type HistoryResponse = HistoryRecord;

// ---------------------------------------------------------------------------
// WebSocket Discriminated Message Payloads (Phase 6 Frozen Contract)
// ---------------------------------------------------------------------------

export interface BaseWebSocketMessage {
  type: WebSocketMessageType;
  timestamp: number;
}

export type WebSocketMessageType =
  | 'audio_update'
  | 'sound_detection'
  | 'speech_update'
  | 'safety_event'
  | 'channel_update'
  | 'device_status'
  | 'system_status'
  | 'alert';

export interface AudioUpdateMessage extends BaseWebSocketMessage {
  type: 'audio_update';
  payload: {
    signalLevel: number;
    signalLevelDb: number;
    speechDetected: boolean;
    speechConfidence: number;
    processingState: ProcessingState;
    samples?: number[];
    frameIndex?: number;
  };
}

export interface SoundDetectionMessage extends BaseWebSocketMessage {
  type: 'sound_detection';
  payload: {
    id: string;
    category: SoundCategory;
    confidence: number;
    intensity: number;
    priority: Priority;
    isSafetyEvent: boolean;
  };
}

export interface SpeechUpdateMessage extends BaseWebSocketMessage {
  type: 'speech_update';
  payload: {
    speechDetected: boolean;
    confidence: number;
    processingState: ProcessingState;
  };
}

export interface SafetyEventMessage extends BaseWebSocketMessage {
  type: 'safety_event';
  payload: {
    id: string;
    category: SoundCategory;
    confidence: number;
    severity: AlertSeverity;
    priority: Priority;
    state: 'active' | 'cleared' | 'acknowledged';
    description: string;
  };
}

export interface ChannelUpdateMessage extends BaseWebSocketMessage {
  type: 'channel_update';
  payload: {
    channels: Array<{
      channel: number;
      activation: number;
      tLevel: number;
      cLevel: number;
    }>;
    strategy: ChannelStrategy;
    activeChannels: number;
  };
}

export interface DeviceStatusMessage extends BaseWebSocketMessage {
  type: 'device_status';
  payload: {
    esp32Connected: boolean;
    microphoneActive: boolean;
    aiEngine: ProcessingState;
    dspEngine: ProcessingState;
    ledArrayActive: boolean;
    serialCommunicationOk: boolean;
  };
}

export interface SystemStatusMessage extends BaseWebSocketMessage {
  type: 'system_status';
  payload: {
    backendStatus: ConnectionStatus;
    aiEngineState: ProcessingState;
    dspEngineState: ProcessingState;
    overallHealth: 'healthy' | 'degraded' | 'critical' | 'offline';
  };
}

export interface AlertMessage extends BaseWebSocketMessage {
  type: 'alert';
  payload: {
    id: string;
    severity: AlertSeverity;
    alertType: AlertType;
    message: string;
    source: LogComponent;
  };
}

export type RealtimeMessage =
  | AudioUpdateMessage
  | SoundDetectionMessage
  | SpeechUpdateMessage
  | SafetyEventMessage
  | ChannelUpdateMessage
  | DeviceStatusMessage
  | SystemStatusMessage
  | AlertMessage;
