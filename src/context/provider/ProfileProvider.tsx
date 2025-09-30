import React, { createContext, useContext, useState, useCallback } from 'react';
import { mapApiErrorToToast } from '../../utils/ErrorHandlerService';
import { profileService } from '../../api/profileService';
import type {
  ProfileState,
  ProfileUpdateProfileDTO2 as UpdateProfileDTO,
  ProfileUpdatePreferencesDTO2 as UpdatePreferencesDTO,
  ProfileChangePasswordDTO2 as ChangePasswordDTO,
  ProfilePaginatedActivityFull as PaginatedActivity
} from '@/types/profile';

interface ProfileContextType extends ProfileState {
  fetchProfile: () => Promise<void>;
  updateProfile: (dto: UpdateProfileDTO) => Promise<void>;
  updatePreferences: (dto: UpdatePreferencesDTO) => Promise<void>;
  changePassword: (dto: ChangePasswordDTO) => Promise<void>;
  refreshSessions: () => Promise<void>;
  revokeSession: (id: string) => Promise<void>;
  bulkRevokeOtherSessions: () => Promise<{ revoked: number; errors: number }>;
  loadMoreActivity: () => Promise<void>;
  startMFA: () => Promise<{ otpauthUrl: string; qrSvgData?: string } | null>;
  verifyMFA: (code: string) => Promise<string[] | null>;
  disableMFA: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  uploadingAvatar?: boolean;
}

const initialState: ProfileState = {
  profile: null,
  sessions: [],
  activity: [],
  hasMoreActivity: false,
  loadingProfile: false,
  loadingSessions: false,
  loadingActivity: false,
  updating: false,
  error: null
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProfileState>(initialState);
  const [activityCursor, setActivityCursor] = useState<string | null | undefined>(undefined);

  const setPartial = (patch: Partial<ProfileState>) =>
    setState(prev => ({ ...prev, ...patch }));

  const fetchProfile = useCallback(async () => {
    try {
      setPartial({ loadingProfile: true, error: null });
      const profile = await profileService.getProfile();
      setPartial({ profile, loadingProfile: false });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.fetchProfile');
      setPartial({ error: handled.userMessage || 'Profil yüklenemedi', loadingProfile: false });
    }
  }, []);

  const updateProfile = useCallback(async (dto: UpdateProfileDTO) => {
    try {
      setPartial({ updating: true });
      const profile = await profileService.updateProfile(dto);
      setPartial({ profile, updating: false });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.updateProfile');
      setPartial({ error: handled.userMessage || 'Profil güncellenemedi', updating: false });
    }
  }, []);

  const updatePreferences = useCallback(async (dto: UpdatePreferencesDTO) => {
    try {
      setPartial({ updating: true });
      const profile = await profileService.updatePreferences(dto);
      setPartial({ profile, updating: false });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.updatePreferences');
      setPartial({ error: handled.userMessage || 'Tercihler güncellenemedi', updating: false });
    }
  }, []);

  const changePassword = useCallback(async (dto: ChangePasswordDTO) => {
    try {
      setPartial({ updating: true });
      await profileService.changePassword(dto);
      setPartial({ updating: false });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.changePassword');
      setPartial({ error: handled.userMessage || 'Parola değiştirilemedi', updating: false });
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      setPartial({ loadingSessions: true });
      const sessions = await profileService.getSessions();
      setPartial({ sessions, loadingSessions: false });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.refreshSessions');
      setPartial({ error: handled.userMessage || 'Oturumlar alınamadı', loadingSessions: false });
    }
  }, []);

  const revokeSession = useCallback(async (id: string) => {
    try {
      await profileService.revokeSession(id);
      setPartial({ sessions: state.sessions.filter(s => s.id !== id) });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.revokeSession');
      setPartial({ error: handled.userMessage || 'Oturum sonlandırılamadı' });
    }
  }, [state.sessions]);

  const bulkRevokeOtherSessions = useCallback(async () => {
    const now = Date.now();
    // Heuristic: keep the session with the latest createdAt that is not revoked & not expired as current; revoke others
    const active = state.sessions.filter(s => !s.revokedAt && (!s.expiresAt || new Date(s.expiresAt).getTime() > now));
    const sorted = [...active].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const keep = sorted[0]?.id; // assume most recently created is current
    const candidates = sorted.filter(s => s.id !== keep);
    console.log('[RT][UI] bulkRevoke start keep=', keep, 'candidates=', candidates.map(c => c.id));
    let revoked = 0; let errors = 0;
    for (const sess of candidates) {
      try {
        await profileService.revokeSession(sess.id);
        console.log('[RT][UI] bulk revoke ok', sess.id);
        revoked++;
      } catch (e: any) {
        console.warn('[RT][UI] bulk revoke failed', sess.id, e);
        errors++;
      }
    }
    try { await refreshSessions(); } catch { /* ignore */ }
    console.log('[RT][UI] bulkRevoke finished revoked=', revoked, 'errors=', errors);
    return { revoked, errors };
  }, [state.sessions, refreshSessions]);

  const loadMoreActivity = useCallback(async () => {
    try {
      setPartial({ loadingActivity: true });
      const res: PaginatedActivity = await profileService.getActivity(activityCursor ?? undefined);
      setActivityCursor(res.nextCursor ?? null);

      setPartial({
        activity: [...(state.activity || []), ...(res.items || [])],
        hasMoreActivity: Boolean(res.nextCursor),
        loadingActivity: false
      });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.loadMoreActivity');
      setPartial({ error: handled.userMessage || 'Aktivite alınamadı', loadingActivity: false });
    }
  }, [activityCursor, state.activity]);

  const startMFA = useCallback(async () => {
    try {
      const res = await profileService.startMFA();
      // normalize to older shape { otpauthUrl, qrSvgData }
      return {
        otpauthUrl: res?.otpauthUrl || undefined,
        qrSvgData: res?.qrSvgData
      } as { otpauthUrl: string; qrSvgData?: string } | null;
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.startMFA');
      setPartial({ error: handled.userMessage || 'MFA başlatılamadı' });
      return null;
    }
  }, []);

  const verifyMFA = useCallback(async (code: string) => {
    try {
      const res = await profileService.verifyMFA({ code });
      // profile'ı tekrar çek
      fetchProfile();
      return res?.recoveryCodes ?? null;
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.verifyMFA');
      setPartial({ error: handled.userMessage || 'MFA doğrulanamadı' });
      return null;
    }
  }, [fetchProfile]);

  const disableMFA = useCallback(async () => {
    try {
      await profileService.disableMFA();
      fetchProfile();
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.disableMFA');
      setPartial({ error: handled.userMessage || 'MFA kapatılamadı' });
    }
  }, [fetchProfile]);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setUploadingAvatar(true);
      // basic validation
      if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
        throw new Error('Geçersiz dosya türü');
      }
      if (file.size > 1024 * 1024) {
        throw new Error('Dosya 1MB sınırını aşıyor');
      }
      const { avatarUrl } = await profileService.uploadAvatar(file);
      setPartial({ profile: state.profile ? { ...state.profile, avatarUrl } : state.profile });
    } catch (e: any) {
      const handled = mapApiErrorToToast(e, 'ProfileProvider.uploadAvatar');
      setPartial({ error: handled.userMessage || 'Avatar yüklenemedi' });
    } finally {
      setUploadingAvatar(false);
    }
  }, [state.profile]);

  const value: ProfileContextType = {
    ...state,
    fetchProfile,
    updateProfile,
    updatePreferences,
    changePassword,
    refreshSessions,
    revokeSession,
    bulkRevokeOtherSessions,
    loadMoreActivity,
    startMFA,
    verifyMFA,
    disableMFA,
    uploadAvatar,
    uploadingAvatar
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
