import { 
  UserProfilePublic,
  UpdateProfileDTO,
  UpdatePreferencesDTO,
  ChangePasswordDTO,
  StartMFAResponse,
  VerifyMFARequest,
  VerifyMFAResponse,
  UserSessionSummary,
  PaginatedActivity
} from '@/types/profile';
import httpClient from './httpClient';

function isBypass() {
  return (window as any).__AUTH_BYPASS__ === true || import.meta.env.VITE_AUTH_BYPASS === '1';
}

const mockProfile = {
  id: 'dev-profile',
  username: 'Dev User',
  displayName: 'Dev User',
  fullName: 'Developer User',
  phone: '+905555555555',
  positionTitle: 'Frontend Dev',
  avatarUrl: '',
  mfaEnabled: false,
  preferences: {
    theme: 'light',
    density: 'comfortable',
    locale: 'tr-TR',
    timeZone: 'Europe/Istanbul',
    notifications: { email: true, sms: false, push: true }
  }
};
const mockSessions = [
  { id: 'sess1', device: 'Chrome', ip: '127.0.0.1', lastActive: new Date().toISOString() }
];
const mockActivity = {
  items: [
    { id: 'act1', type: 'LOGIN', timestamp: new Date().toISOString(), details: 'Giriş yapıldı' }
  ],
  nextCursor: null
};

// Thin service layer (can be mocked in tests)
export const profileService = {
  getProfile: async (): Promise<UserProfilePublic> => {
    if (isBypass()) return mockProfile as any;
    const { data } = await httpClient.get('/profile');
    return data;
  },
  updateProfile: async (payload: UpdateProfileDTO): Promise<UserProfilePublic> => {
    if (isBypass()) return { ...mockProfile, ...payload } as any;
    const { data } = await httpClient.put('/profile', payload);
    return data;
  },
  updatePreferences: async (payload: UpdatePreferencesDTO): Promise<UserProfilePublic> => {
    if (isBypass()) return { ...mockProfile, preferences: { ...mockProfile.preferences, ...payload } } as any;
    const { data } = await httpClient.put('/profile/preferences', payload);
    return data;
  },
  changePassword: async (payload: ChangePasswordDTO): Promise<void> => {
    if (isBypass()) return;
    await httpClient.put('/profile/password', payload);
  },
  startMFA: async (): Promise<StartMFAResponse> => {
    if (isBypass()) return { otpauthUrl: 'otpauth://totp/DevUser?secret=DEVSECRET', qrSvgData: '' } as any;
    const { data } = await httpClient.post('/profile/mfa/start', {});
    return data;
  },
  verifyMFA: async (payload: VerifyMFARequest): Promise<VerifyMFAResponse> => {
    if (isBypass()) return { recoveryCodes: ['RCODE1', 'RCODE2', 'RCODE3'] } as any;
    const { data } = await httpClient.post('/profile/mfa/verify', payload);
    return data;
  },
  disableMFA: async (): Promise<void> => {
    if (isBypass()) return;
    await httpClient.delete('/profile/mfa');
  },
  getSessions: async (): Promise<UserSessionSummary[]> => {
    if (isBypass()) return mockSessions as any;
    const { data } = await httpClient.get('/profile/sessions');
    return data;
  },
  revokeSession: async (id: string): Promise<void> => {
    if (isBypass()) return;
    await httpClient.delete(`/profile/sessions/${id}`);
  },
  getActivity: async (cursor?: string): Promise<PaginatedActivity> => {
    if (isBypass()) return mockActivity as any;
    const { data } = await httpClient.get('/profile/activity', { params: { cursor } });
    return data;
  },
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    if (isBypass()) return { avatarUrl: '' };
    const form = new FormData();
    form.append('file', file);
    const { data } = await httpClient.post('/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};
