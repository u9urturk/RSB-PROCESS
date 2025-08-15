// Types for Profile module (based on PROFILE_MODULE_FRONTEND_BRIEF.md)

export interface ProfileApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ProfileApiError {
  success: false;
  timestamp: string;
  path?: string;
  method?: string;
  statusCode: number;
  error: string;
  message: string;
  requestId?: string;
}

export interface ProfileUserPublic {
  id: string;
  username: string;
  email?: string | null;
  locale?: string;
  timeZone?: string;
  theme?: string;
  density?: string;
  notificationEmail: boolean;
  notificationPush: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastPasswordChangeAt?: string | null;
}

export interface ProfileUpdateProfileDTO {
  email?: string | null;
  avatarUrl?: string | null;
}

export interface ProfileUpdatePreferencesDTO {
  locale?: string;
  timeZone?: string;
  theme?: string;
  density?: string;
  notificationEmail?: boolean;
  notificationPush?: boolean;
}

export interface ProfileChangePasswordDTO {
  currentPassword?: string;
  newPassword: string;
}

export interface ProfileUserSessionSummary {
  id: string;
  createdAt: string;
  expiresAt: string;
  ip?: string;
  userAgent?: string;
  revokedAt?: string | null;
  revokedReason?: string | null;
}

export interface ProfileActivityEntry {
  id: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ProfilePaginatedActivity {
  items: ProfileActivityEntry[];
  nextCursor?: string | null;
}

export interface ProfileStartMFAResponse {
  qrCode?: string; // data:image/png;base64,... (legacy)
  otpauthUrl?: string; // otpauth URL for authenticator apps
  qrSvgData?: string;
}

export interface ProfileVerifyMFARequest {
  token: string;
}

export interface ProfileVerifyMFAResponse {
  recoveryCodes?: string[];
}

export type ProfileMfaEnableResponse = ProfileStartMFAResponse;
// Profile domain specific types (initial skeleton)
export type ProfileUserStatus = 'active' | 'pending' | 'suspended' | 'disabled';
export type ProfileUserRole = 'ADMIN' | 'MANAGER' | 'WAITER' | 'CASHIER' | 'USER' | 'OWNER';
export type ProfileThemePreference = 'light' | 'dark' | 'system';
export type ProfileDensityPreference = 'comfortable' | 'compact';
export type ProfileMFAMethod = 'totp';

export interface ProfileUserPreferences {
  locale: string;
  timeZone: string;
  theme: ProfileThemePreference;
  density: ProfileDensityPreference;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface ProfileUserFull {
  id: string;
  username: string;
  displayName: string;
  fullName?: string;
  email?: string | null;
  phone?: string;
  avatarUrl?: string | null;
  roles: ProfileUserRole[];
  permissions: string[];
  status: ProfileUserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastPasswordChangeAt?: string | null;
  mfaEnabled: boolean;
  preferences: ProfileUserPreferences;
  positionTitle?: string;
  currentShiftId?: string;
  shiftStats?: {
    totalOrders?: number;
    avgServeTime?: number; // minutes
  };
}

export interface ProfileUserSessionDetail {
  id: string;
  issuedAt: string;
  lastSeenAt: string;
  ip?: string;
  userAgent?: string;
  current: boolean;
  revokedAt?: string | null;
}

export type ProfileActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'MFA_ENABLE'
  | 'MFA_DISABLE'
  | 'SESSION_REVOKE'
  | 'PREFERENCE_UPDATE';

export interface ProfileUserActivityLogItem {
  id: string;
  type: ProfileActivityType;
  createdAt: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any>;
}

export interface ProfilePaginatedActivityFull {
  items: ProfileUserActivityLogItem[];
  nextCursor?: string | null;
}

// Update DTOs
export interface ProfileUpdateProfileDTO2 {
  displayName?: string;
  fullName?: string;
  phone?: string;
  positionTitle?: string;
}

export interface ProfileUpdatePreferencesDTO2 {
  locale?: string;
  timeZone?: string;
  theme?: ProfileThemePreference;
  density?: ProfileDensityPreference;
  notifications?: Partial<ProfileUserPreferences['notifications']>;
}

export interface ProfileChangePasswordDTO2 {
  currentPassword?: string;
  newPassword: string;
}

export interface ProfileStartMFAResponse2 {
  otpauthUrl?: string; // For QR generation client side if needed
  qrSvgData?: string; // Optional pre-rendered
}

export interface ProfileVerifyMFARequest2 {
  code?: string;
}

export interface ProfileVerifyMFAResponse2 {
  recoveryCodes?: string[]; // One-time display
}

export interface ProfileState {
  profile: ProfileUserFull | null;
  sessions: ProfileUserSessionDetail[];
  activity: ProfileUserActivityLogItem[];
  hasMoreActivity: boolean;
  loadingProfile: boolean;
  loadingSessions: boolean;
  loadingActivity: boolean;
  updating: boolean;
  error?: string | null;
}
