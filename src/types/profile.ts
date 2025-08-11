// Profile domain specific types (initial skeleton)
export type UserStatus = 'active' | 'pending' | 'suspended' | 'disabled';
export type UserRole = 'ADMIN' | 'MANAGER' | 'WAITER' | 'CASHIER' | 'USER' | 'OWNER';
export type ThemePreference = 'light' | 'dark' | 'system';
export type DensityPreference = 'comfortable' | 'compact';
export type MFAMethod = 'totp';

export interface UserPreferences {
  locale: string;
  timeZone: string;
  theme: ThemePreference;
  density: DensityPreference;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface UserProfilePublic {
  id: string;
  username: string;
  displayName: string;
  fullName?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  roles: UserRole[];
  permissions: string[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastPasswordChangeAt?: string;
  mfaEnabled: boolean;
  preferences: UserPreferences;
  positionTitle?: string;
  currentShiftId?: string;
  shiftStats?: {
    totalOrders?: number;
    avgServeTime?: number; // minutes
  };
}

export interface UserSessionSummary {
  id: string;
  issuedAt: string;
  lastSeenAt: string;
  ip?: string;
  userAgent?: string;
  current: boolean;
  revokedAt?: string;
}

export type ActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'MFA_ENABLE'
  | 'MFA_DISABLE'
  | 'SESSION_REVOKE'
  | 'PREFERENCE_UPDATE';

export interface UserActivityLogItem {
  id: string;
  type: ActivityType;
  createdAt: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any>;
}

export interface PaginatedActivity {
  items: UserActivityLogItem[];
  nextCursor?: string;
}

// Update DTOs
export interface UpdateProfileDTO {
  displayName?: string;
  fullName?: string;
  phone?: string;
  positionTitle?: string;
}

export interface UpdatePreferencesDTO {
  locale?: string;
  timeZone?: string;
  theme?: ThemePreference;
  density?: DensityPreference;
  notifications?: Partial<UserPreferences['notifications']>;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface StartMFAResponse {
  otpauthUrl: string; // For QR generation client side if needed
  qrSvgData?: string; // Optional pre-rendered
}

export interface VerifyMFARequest {
  code: string;
}

export interface VerifyMFAResponse {
  recoveryCodes: string[]; // One-time display
}

export interface ProfileState {
  profile: UserProfilePublic | null;
  sessions: UserSessionSummary[];
  activity: UserActivityLogItem[];
  hasMoreActivity: boolean;
  loadingProfile: boolean;
  loadingSessions: boolean;
  loadingActivity: boolean;
  updating: boolean;
  error?: string | null;
}
