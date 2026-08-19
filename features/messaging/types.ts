export interface MessagePayload {
  to: string; // Phone number e.g. "4771234567" or "+524771234567"
  body: string;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  timestamp: string;
}

export interface EvolutionApiConfig {
  apiUrl: string;
  apiKey: string;
  instance: string;
}

export interface AuditionNotificationData {
  fullName: string;
  folio: string;
  programName: string;
  productionName?: string;
  phone: string;
  email?: string;
  auditionDate?: string;
  auditionTime?: string;
  assignedRole?: string;
  overallScore?: number;
  notes?: string;
}

export interface EvolutionInstanceStatus {
  connected: boolean;
  instanceName: string;
  state: "open" | "close" | "connecting" | "qrcode" | "unconfigured";
  profileName?: string;
  profilePictureUrl?: string;
}
