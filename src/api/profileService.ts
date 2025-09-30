import {
  ProfileUserFull as UserProfileFull,
  ProfileUpdateProfileDTO2 as UpdateProfileDTO,
  ProfileUpdatePreferencesDTO2 as UpdatePreferencesDTO,
  ProfileChangePasswordDTO2 as ChangePasswordDTO,
  ProfileStartMFAResponse2 as StartMFAResponse,
  ProfileVerifyMFARequest2 as VerifyMFARequest,
  ProfileVerifyMFAResponse2 as VerifyMFAResponse,
  ProfileUserSessionDetail as UserSessionDetail,
  ProfilePaginatedActivityFull as PaginatedActivity,
  ProfileUserActivityLogItem as ProfileUserActivityLogItem,
} from '@/types/profile';
import { apiGet, apiPut, apiPost, apiDelete } from './httpClient';

export const profileService = {
  getProfile: async (): Promise<UserProfileFull> => {
    const data = await apiGet<UserProfileFull>('/profile/me');
    console.debug('ProfileService.getProfile', data);
    return data;
  },
  updateProfile: async (payload: UpdateProfileDTO): Promise<UserProfileFull> => {
    const data = await apiPut<UserProfileFull>('/profile/me', payload);
    console.debug('ProfileService.updateProfile', data);
    return data;
  },
  updatePreferences: async (payload: UpdatePreferencesDTO): Promise<UserProfileFull> => {
    const data = await apiPut<UserProfileFull>('/profile/me/preferences', payload);
    console.debug('ProfileService.updatePreferences', data);
    return data;
  },
  changePassword: async (payload: ChangePasswordDTO): Promise<void> => {
    await apiPut('/profile/me/password', payload);
  },
  // MFA enable -> returns QR / otpauth url
  enableMFA: async (): Promise<StartMFAResponse> => {
    const data = await apiPost<StartMFAResponse>('/profile/mfa/enable', {});
    return data;
  },
  // kept for backward compatibility
  startMFA: async (): Promise<StartMFAResponse> => {
    return await (profileService as any).enableMFA();
  },
  verifyMFA: async (payload: VerifyMFARequest): Promise<VerifyMFAResponse> => {
    const data = await apiPost<VerifyMFAResponse>('/profile/mfa/verify', payload);
    return data;
  },
  disableMFA: async (payload?: any): Promise<void> => {
    // brief specifies POST /profile/mfa/disable with TOTP token in body
    await apiPost('/profile/mfa/disable', payload || {});
  },
  getSessions: async (): Promise<UserSessionDetail[]> => {
    const data = await apiGet<UserSessionDetail[]>('/profile/me/sessions');
    return data;
  },
  revokeSession: async (id: string): Promise<void> => {
    await apiDelete(`/profile/me/sessions/${id}`);
  },
  // Bulk revoke sessions - keepCurrent=true to keep current session
  bulkRevokeSessions: async (keepCurrent = true): Promise<void> => {
    await apiDelete('/profile/me/sessions', { params: { keepCurrent } });
  },
  getActivity: async (cursor?: string): Promise<PaginatedActivity> => {
    // backend should return { items: ProfileUserActivityLogItem[], nextCursor?: string | null }
    const data = await apiGet<any>('/profile/me/activity', { params: { cursor } });

    // Defensive normalization: ensure items is an array of activity items
    const rawItems: unknown[] = Array.isArray(data?.items)
      ? data.items
      : data && data.items && typeof data.items === 'object'
        ? Object.values(data.items as any)
        : [];

    const items: ProfileUserActivityLogItem[] = rawItems
      .filter((it): it is ProfileUserActivityLogItem => !!it && typeof (it as any).id === 'string' && typeof (it as any).createdAt === 'string')
      .map(i => i as ProfileUserActivityLogItem);

    return {
      items,
      nextCursor: data?.nextCursor ?? null
    };
  },
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const form = new FormData();
    form.append('file', file);
    const data = await apiPost<{ avatarUrl: string }>('/profile/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  getUserWithRoles: async (): Promise<UserWithRoles> => {
    const data = await apiGet<UserWithRoles>(`/profile/users-with-roles`)
    return data;
  }
};


type UserWithRoles = {
  id: string,
  username: string,
  name: string | null,
  surname: string | null,
  email: string | null,
  avatarUrl: string | null,
  createdAt: string,
  updatedAt: string,
  roles: string[]
};