
export enum DeviceStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  BYPASSING = 'BYPASSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface DeviceInfo {
  model: string;
  version: string;
  serial: string;
  imei: string;
  status: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}
