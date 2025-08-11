import React, { createContext, useContext, useState, useCallback } from 'react';
import { profileService } from '../../api/profileService';
import type {
  ProfileState,
  UpdateProfileDTO,
  UpdatePreferencesDTO,
  ChangePasswordDTO,
  PaginatedActivity
} from '@/types/profile';

interface ProfileContextType extends ProfileState {
  fetchProfile: () => Promise<void>;
  updateProfile: (dto: UpdateProfileDTO) => Promise<void>;
  updatePreferences: (dto: UpdatePreferencesDTO) => Promise<void>;
  changePassword: (dto: ChangePasswordDTO) => Promise<void>;
  refreshSessions: () => Promise<void>;
  revokeSession: (id: string) => Promise<void>;
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
  const [activityCursor, setActivityCursor] = useState<string | undefined>(undefined);

  const setPartial = (patch: Partial<ProfileState>) =>
    setState(prev => ({ ...prev, ...patch }));

  const fetchProfile = useCallback(async () => {
    try {
      setPartial({ loadingProfile: true, error: null });
      const profile = await profileService.getProfile();
      setPartial({ profile, loadingProfile: false });
    } catch (e: any) {
      setPartial({ error: e.message || 'Profil yüklenemedi', loadingProfile: false });
    }
  }, []);

  const updateProfile = useCallback(async (dto: UpdateProfileDTO) => {
    try {
      setPartial({ updating: true });
      const profile = await profileService.updateProfile(dto);
      setPartial({ profile, updating: false });
    } catch (e: any) {
      setPartial({ error: e.message || 'Profil güncellenemedi', updating: false });
    }
  }, []);

  const updatePreferences = useCallback(async (dto: UpdatePreferencesDTO) => {
    try {
      setPartial({ updating: true });
      const profile = await profileService.updatePreferences(dto);
      setPartial({ profile, updating: false });
    } catch (e: any) {
      setPartial({ error: e.message || 'Tercihler güncellenemedi', updating: false });
    }
  }, []);

  const changePassword = useCallback(async (dto: ChangePasswordDTO) => {
    try {
      setPartial({ updating: true });
      await profileService.changePassword(dto);
      setPartial({ updating: false });
    } catch (e: any) {
      setPartial({ error: e.message || 'Parola değiştirilemedi', updating: false });
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      setPartial({ loadingSessions: true });
      const sessions = await profileService.getSessions();
      setPartial({ sessions, loadingSessions: false });
    } catch (e: any) {
      setPartial({ error: e.message || 'Oturumlar alınamadı', loadingSessions: false });
    }
  }, []);

  const revokeSession = useCallback(async (id: string) => {
    try {
      await profileService.revokeSession(id);
      setPartial({ sessions: state.sessions.filter(s => s.id !== id) });
    } catch (e: any) {
      setPartial({ error: e.message || 'Oturum sonlandırılamadı' });
    }
  }, [state.sessions]);

  const loadMoreActivity = useCallback(async () => {
    try {
      setPartial({ loadingActivity: true });
      const res: PaginatedActivity = await profileService.getActivity(activityCursor);
      setActivityCursor(res.nextCursor);
      setPartial({
        activity: [...state.activity, ...res.items],
        hasMoreActivity: Boolean(res.nextCursor),
        loadingActivity: false
      });
    } catch (e: any) {
      setPartial({ error: e.message || 'Aktivite alınamadı', loadingActivity: false });
    }
  }, [activityCursor, state.activity]);

  const startMFA = useCallback(async () => {
    try {
      const res = await profileService.startMFA();
      return res;
    } catch (e: any) {
      setPartial({ error: e.message || 'MFA başlatılamadı' });
      return null;
    }
  }, []);

  const verifyMFA = useCallback(async (code: string) => {
    try {
      const res = await profileService.verifyMFA({ code });
      // profile'ı tekrar çek
      fetchProfile();
      return res.recoveryCodes;
    } catch (e: any) {
      setPartial({ error: e.message || 'MFA doğrulanamadı' });
      return null;
    }
  }, [fetchProfile]);

  const disableMFA = useCallback(async () => {
    try {
      await profileService.disableMFA();
      fetchProfile();
    } catch (e: any) {
      setPartial({ error: e.message || 'MFA kapatılamadı' });
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
      setPartial({ error: e.message || 'Avatar yüklenemedi' });
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
