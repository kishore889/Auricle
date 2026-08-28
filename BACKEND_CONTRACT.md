# AURICLE — Authoritative Backend API & WebSocket Contract

> **FROZEN CONTRACT SPECIFICATION FOR FASTAPI BACKEND DEVELOPMENT STAGE**  
> **Project**: AURICLE – AI-Assisted Hearing and Cochlear-Inspired Stimulation Research Prototype  
> **Version**: 1.0.0 (Phase 6 Contract Freeze)

---

## 1. System Architecture & Boundaries

```text
React Frontend (Vite + TypeScript)
      │
      ├── REST API Requests (via src/api/client.ts)
      └── WebSocket Real-time Feed (via src/services/websocket.ts)
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│              Future FastAPI Backend Gateway             │
└───────────┬─────────────────┬─────────────────┬─────────┘
            │                 │                 │
            ▼                 ▼                 ▼
       PostgreSQL        AI / DSP Models    Hardware Service
    (Users/Logs/Alerts) (Speech/Safety)     (ESP32 Serial)
```

### Architectural Strict Rules
1. **No direct database access**: The React frontend NEVER connects to PostgreSQL directly.
2. **No direct hardware communication**: The React frontend NEVER accesses WebSerial, ESP32, or INMP441 drivers directly.
3. **Strict URL resolution**: Frontend deriving base URLs exclusively from runtime variables:
   - REST API Base URL: `import.meta.env.VITE_API_BASE_URL`
   - WebSocket Base URL: `import.meta.env.VITE_WS_BASE_URL`

---

## 2. Environment Configuration

The frontend relies on these environment variables (defined in `.env`):

```bash
# REST API Base Address
VITE_API_BASE_URL=http://localhost:8000

# WebSocket Gateway Address
VITE_WS_BASE_URL=ws://localhost:8000
```

---

## 3. Authentication Architecture & Security

### Flow Strategy
```text
Frontend Login (Email/Username + Password)
        │
        ▼
POST /api/auth/login
        │
        ├── Backend returns JSON: { "accessToken": "...", "user": {...}, "expiresIn": 3600 }
        └── Backend sets HttpOnly Cookie: refreshToken=...; Secure; SameSite=Strict
        │
        ▼
Frontend Stores Access Token IN-MEMORY ONLY (Zustand `authStore`)
(NEVER stored in localStorage or sessionStorage)
        │
        ▼
Subsequent API Requests: Header `Authorization: Bearer <accessToken>`
Credentials: `credentials: 'include'` (sends HttpOnly refresh cookie)
        │
        ▼
Token Expiry / Refresh:
POST /api/auth/refresh (uses HttpOnly cookie automatically) -> Returns new accessToken
```

---

## 4. Standardized API Error Contract

All non-2xx HTTP responses from the backend MUST return the following JSON structure:

```json
{
  "error": {
    "code": "DEVICE_DISCONNECTED",
    "message": "ESP32 hardware device is unavailable or uncommunicative.",
    "details": {
      "port": "COM3",
      "lastHeartbeatMs": 45000
    }
  }
}
```

### Expected Error Codes
- `AUTH_INVALID_CREDENTIALS` (401)
- `AUTH_TOKEN_EXPIRED` (401)
- `AUTH_UNAUTHORIZED` (403)
- `RESOURCE_NOT_FOUND` (404)
- `DEVICE_DISCONNECTED` (503)
- `MIC_SAMPLING_ERROR` (503)
- `AI_INFERENCE_TIMEOUT` (504)
- `VALIDATION_ERROR` (422)

---

## 5. Standardized REST API Endpoints Contract (19 Endpoints)

### 5.1 Authentication Endpoints

#### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "researcher@auricle.local",
    "password": "auricle2024"
  }
  ```
- **Response (200 OK)**: `LoginResponse`
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 3600,
    "user": {
      "id": "usr-001",
      "email": "researcher@auricle.local",
      "username": "researcher",
      "displayName": "Dr. Alex Mercer",
      "role": "researcher",
      "createdAt": "2024-01-15T08:00:00Z",
      "lastLoginAt": "2024-08-24T10:00:00Z"
    }
  }
  ```

#### `POST /api/auth/refresh`
- **Request**: Uses HttpOnly session cookie (`refreshToken`)
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 3600
  }
  ```

#### `POST /api/auth/logout`
- **Response (200 OK)**: `204 No Content` (Clears refresh cookie)

#### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: `UserResponse`

---

### 5.2 Device Telemetry Endpoints

#### `GET /api/device/status`
- **Response (200 OK)**: `DeviceStatusResponse`
  ```json
  {
    "esp32Connected": true,
    "esp32Id": "ESP32-AURICLE-001",
    "esp32LastHeartbeat": "2024-08-24T10:55:00Z",
    "microphoneActive": true,
    "microphoneInputState": "sampling",
    "microphoneLastUpdate": "2024-08-24T10:55:00Z",
    "aiEngineState": "running",
    "dspEngineState": "running",
    "ledArrayActive": true,
    "ledArrayChannels": 22,
    "serialCommunicationOk": true,
    "backendRestStatus": "connected",
    "backendWsStatus": "connected",
    "overallHealth": "healthy",
    "lastUpdated": "2024-08-24T10:55:00Z"
  }
  ```

#### `GET /api/device`
- **Response (200 OK)**:
  ```json
  {
    "id": "ESP32-AURICLE-001",
    "name": "Auricle Research Prototype v1",
    "type": "esp32",
    "firmwareVersion": "0.3.2-alpha",
    "connectedAt": "2024-08-24T08:00:00Z"
  }
  ```

---

### 5.3 Audio Processing Endpoints

#### `GET /api/audio/status`
- **Response (200 OK)**: `AudioStatusResponse`
  ```json
  {
    "isMonitoring": true,
    "processingState": "running",
    "sampleRate": 16000,
    "signalLevel": 0.42,
    "signalLevelDb": -7.5,
    "inputConnected": true,
    "enhancementActive": true,
    "latencyMs": 28
  }
  ```

#### `POST /api/audio/start`
- **Response (200 OK)**: `204 No Content`

#### `POST /api/audio/stop`
- **Response (200 OK)**: `204 No Content`

---

### 5.4 Sound Analysis Endpoints

#### `GET /api/sound-analysis/current`
- **Response (200 OK)**: `SoundDetectionResponse`
  ```json
  {
    "id": "det-cur-001",
    "timestamp": "2024-08-24T10:55:00Z",
    "category": "speech",
    "confidence": 0.91,
    "intensity": 0.65,
    "priority": "medium",
    "rawLabel": "speech",
    "isSafetyEvent": false
  }
  ```

#### `GET /api/sound-analysis/history`
- **Query Params**: `page`, `pageSize`, `category`, `priority`, `from`, `to`
- **Response (200 OK)**: `PaginatedResponse<SoundDetectionResponse>`

---

### 5.5 Speech Understanding Endpoints

#### `GET /api/speech/current`
- **Response (200 OK)**: `SpeechResultResponse`
  ```json
  {
    "id": "sp-001",
    "timestamp": "2024-08-24T10:55:00Z",
    "speechDetected": true,
    "confidence": 0.88,
    "transcriptionPlaceholder": "[Speech detected — transcription pending backend STT]",
    "processingState": "running",
    "durationMs": 1240
  }
  ```

#### `GET /api/speech/history`
- **Query Params**: `page`, `pageSize`
- **Response (200 OK)**: `PaginatedResponse<SpeechResultResponse>`

---

### 5.6 Cochlear-Inspired Channel Simulation Endpoints

#### `GET /api/channels/profile`
- **Response (200 OK)**: `ChannelProfileResponse`
  ```json
  {
    "id": "profile-001",
    "name": "Research Default",
    "strategy": "cis_inspired",
    "totalChannels": 22,
    "activeChannels": 18,
    "activations": [
      { "channel": 1, "label": "CH01", "activation": 0.78, "tLevel": 20, "cLevel": 80, "active": true },
      { "channel": 2, "label": "CH02", "activation": 0.31, "tLevel": 25, "cLevel": 75, "active": true }
    ],
    "lastUpdated": "2024-08-24T10:55:00Z",
    "sessionId": "session-001"
  }
  ```

#### `PUT /api/channels/profile`
- **Request Body**: `{ "strategy": "cis_inspired", "name": "Custom Profile" }`
- **Response (200 OK)**: `ChannelProfileResponse`

#### `GET /api/channels/status`
- **Response (200 OK)**: `ChannelStatusResponse`

---

### 5.7 AI Insights Endpoints

#### `GET /api/ai/status`
- **Response (200 OK)**: `{ "state": "running", "modelLoaded": true, "modelVersion": "v1.2", "lastInferenceMs": 42 }`

#### `GET /api/ai/insights`
- **Query Params**: `page`, `pageSize`
- **Response (200 OK)**: `PaginatedResponse<AIInsightResponse>`

---

### 5.8 Audit Event History Endpoint

#### `GET /api/history`
- **Query Params**: `page`, `pageSize`, `from`, `to`, `eventType`, `category`, `priority`, `search`
- **Response (200 OK)**: `PaginatedResponse<HistoryResponse>`

---

### 5.9 Alerts Management Endpoints

#### `GET /api/alerts`
- **Query Params**: `page`, `pageSize`, `status`, `severity`, `type`
- **Response (200 OK)**: `PaginatedResponse<AlertResponse>`

#### `PATCH /api/alerts/{id}`
- **Request Body**: `{ "status": "acknowledged" }` or `{ "status": "resolved" }`
- **Response (200 OK)**: `AlertResponse`

---

### 5.10 System Logs Endpoint

#### `GET /api/logs`
- **Query Params**: `page`, `pageSize`, `level`, `component`, `search`
- **Response (200 OK)**: `PaginatedResponse<SystemLogResponse>`

---

### 5.11 Profile & Sessions Endpoints

#### `GET /api/profile` & `PUT /api/profile`
- **Response (200 OK)**: `UserResponse`

#### `GET /api/sessions` & `POST /api/sessions`
- **Response (200 OK)**: `SessionResponse`

---

## 6. WebSocket Protocol Contract

### Connection URL
`ws://<VITE_WS_BASE_URL>/ws?token=<accessToken>`

### Discriminated Event Families (8 Message Types)

#### 1. `audio_update`
```json
{
  "type": "audio_update",
  "timestamp": 1724470000,
  "payload": {
    "signalLevel": 0.42,
    "signalLevelDb": -7.5,
    "speechDetected": true,
    "speechConfidence": 0.88,
    "processingState": "running"
  }
}
```

#### 2. `sound_detection`
```json
{
  "type": "sound_detection",
  "timestamp": 1724470000,
  "payload": {
    "id": "det-101",
    "category": "vehicle_horn",
    "confidence": 0.96,
    "intensity": 0.82,
    "priority": "high",
    "isSafetyEvent": true
  }
}
```

#### 3. `speech_update`
```json
{
  "type": "speech_update",
  "timestamp": 1724470000,
  "payload": {
    "speechDetected": true,
    "confidence": 0.91,
    "processingState": "running"
  }
}
```

#### 4. `safety_event`
```json
{
  "type": "safety_event",
  "timestamp": 1724470000,
  "payload": {
    "id": "safe-001",
    "category": "siren",
    "confidence": 0.98,
    "severity": "critical",
    "priority": "critical",
    "state": "active",
    "description": "Emergency siren detected in vicinity."
  }
}
```

#### 5. `channel_update`
```json
{
  "type": "channel_update",
  "timestamp": 1724470000,
  "payload": {
    "channels": [
      { "channel": 1, "activation": 0.78, "tLevel": 20, "cLevel": 80 },
      { "channel": 2, "activation": 0.31, "tLevel": 25, "cLevel": 75 }
    ],
    "strategy": "cis_inspired",
    "activeChannels": 18
  }
}
```

#### 6. `device_status`
```json
{
  "type": "device_status",
  "timestamp": 1724470000,
  "payload": {
    "esp32Connected": true,
    "microphoneActive": true,
    "aiEngine": "running",
    "dspEngine": "running",
    "ledArrayActive": true,
    "serialCommunicationOk": true
  }
}
```

#### 7. `system_status`
```json
{
  "type": "system_status",
  "timestamp": 1724470000,
  "payload": {
    "backendStatus": "connected",
    "aiEngineState": "running",
    "dspEngineState": "running",
    "overallHealth": "healthy"
  }
}
```

#### 8. `alert`
```json
{
  "type": "alert",
  "timestamp": 1724470000,
  "payload": {
    "id": "alt-501",
    "severity": "warning",
    "alertType": "vehicle_horn",
    "message": "Vehicle horn safety threshold exceeded",
    "source": "ai_engine"
  }
}
```

---

## 7. Frontend Page Consumption Matrix

| Page / Component | Consumed REST Endpoints | Consumed WS Events |
| :--- | :--- | :--- |
| **LoginPage** | `POST /api/auth/login` | — |
| **Header / Status Bar** | `GET /api/device/status` | `system_status`, `device_status`, `alert` |
| **DashboardPage** | `GET /api/device/status`, `GET /api/sound-analysis/current`, `GET /api/speech/current` | `audio_update`, `sound_detection`, `alert` |
| **LiveAudioPage** | `GET /api/audio/status`, `POST /api/audio/start`, `POST /api/audio/stop` | `audio_update` |
| **SoundAnalysisPage** | `GET /api/sound-analysis/current`, `GET /api/sound-analysis/history` | `sound_detection`, `safety_event` |
| **SpeechUnderstandingPage** | `GET /api/speech/current`, `GET /api/speech/history` | `speech_update` |
| **DeviceStatusPage** | `GET /api/device/status`, `GET /api/device` | `device_status`, `system_status` |
| **ChannelSimulationPage** | `GET /api/channels/profile`, `PUT /api/channels/profile` | `channel_update` |
| **AIInsightsPage** | `GET /api/ai/status`, `GET /api/ai/insights` | `sound_detection` |
| **HistoryPage** | `GET /api/history` | — |
| **AlertsPage** | `GET /api/alerts`, `PATCH /api/alerts/{id}` | `alert`, `safety_event` |
| **SystemLogsPage** | `GET /api/logs` | — |
| **SettingsPage** | `GET /api/profile`, `PUT /api/profile`, `GET /api/channels/profile` | — |

---

## 8. Mock-to-Real Backend Migration Checklist

When initiating the FastAPI backend development stage:
1. Implement FastAPI authentication router handling `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`.
2. Configure CORS middleware allowing origin matching `VITE_API_BASE_URL` with `allow_credentials=True`.
3. Implement PostgreSQL database schema for Users, Detections, Alerts, Sessions, and System Logs.
4. Implement WebSocket endpoint at `/ws` sending discriminated JSON messages matching Section 6 payload contracts.
5. In the React frontend, point `.env` variables `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` to the running FastAPI server. Zero frontend code changes in `src/` will be required.

---

**API CONTRACT IS FROZEN FOR FRONTEND PHASES 0–6.**
