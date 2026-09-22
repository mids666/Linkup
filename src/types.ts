export type Gender = 'male' | 'female' | 'nonbinary' | 'other';
export type GenderPreference = 'any' | 'male' | 'female' | 'nonbinary';
export type ThemeId =
  | 'cyber-dark'
  | 'neon-violet'
  | 'sunset-ember'
  | 'emerald-matrix'
  | 'nordic-frost'
  | 'clean-light';

export interface UserProfile {
  id: string;
  name: string;
  avatarSeed: string;
  age?: number;
  gender?: Gender;
  country?: string;
  countryCode?: string;
  countryFlag?: string;
  genderPreference?: GenderPreference;
  hasSignedUp?: boolean;
  isOnline?: boolean;
  status?: 'idle' | 'searching' | 'in_call';
}

export interface PartnerInfo {
  id: string;
  name: string;
  avatarSeed: string;
  age?: number;
  gender?: Gender;
  country?: string;
  countryFlag?: string;
}

export interface FavoriteUser {
  id: string;
  name: string;
  avatarSeed: string;
  addedAt: number;
  notes?: string;
  lastMetAt?: number;
  age?: number;
  gender?: Gender;
  country?: string;
  countryFlag?: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetUserId: string;
  targetUserName: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'underage' | 'other';
  details?: string;
  timestamp: number;
}

export interface EncryptedMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  text: string;
  // Cryptographic audit details for transparency
  ivHex?: string;
  ciphertextHex?: string;
  isEncrypted: boolean;
}

export interface CryptoInspectorData {
  algorithm: string;
  keyExchange: string;
  sharedKeyFingerprint: string;
  safetyNumber: string;
  isVerified: boolean;
  lastEncryptedPayload?: {
    iv: string;
    ciphertextSnippet: string;
    authTagSnippet: string;
    timestamp: number;
  };
}

export type CallStatus =
  | 'idle'
  | 'searching'
  | 'connecting'
  | 'connected'
  | 'partner_disconnected'
  | 'partner_skipped';

export interface IncomingCallData {
  callId: string;
  caller: {
    id: string;
    name: string;
    avatarSeed: string;
  };
  roomId: string;
}

export interface ServerStats {
  onlineCount: number;
  activeChatCount: number;
  queueCount: number;
}
