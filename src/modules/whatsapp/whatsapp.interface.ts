export interface ResponseSession {
  name: string;
  status: SessionStatus;
  config: string | null;
  me: JSON;
  engine: JSON;
}

export interface QrCodeResponse {
  data: string;
}

interface Payload {
  name: string;
  status: SessionStatus;
}

export interface WebhookRequest {
  session: string;
  payload: Payload;
}

export enum SessionStatus {
  STARTING = 'STARTING',
  WORKING = 'WORKING',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
  SCAN_QR_CODE = 'SCAN_QR_CODE',
}
