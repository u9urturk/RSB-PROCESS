import React, { useEffect, useState } from 'react';
import { useNotification } from '@/context/provider/NotificationProvider';
import { useProfile } from '@/context/provider/ProfileProvider';
import type {
  ProfileThemePreference,
  ProfileDensityPreference
} from '@/types/profile';
import { SafeQRCode } from '@/components/SafeQRCode';
import InDevelopmentOverlay from '@/components/InDevelopmentOverlay';
import ActivityLog from '@/components/ActivityLog';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const InputField: React.FC<{
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, disabled }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-gray-600 font-medium">{label}</span>
    <input
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white disabled:opacity-60"
    />
  </label>
);

// Session list component extracted for clarity & richer UI
type UserSession = {
  id: string;
  createdAt?: string;
  expiresAt?: string;
  ip?: string;
  userAgent?: string;
  revokedAt?: string | null;
  revokedReason?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  isCurrent?: boolean;
  status?: string; 
};

const SessionsList: React.FC<{ sessions: UserSession[]; revokeSession: (id: string) => any }> = ({ sessions, revokeSession }) => {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [expandedUA, setExpandedUA] = useState<string | null>(null);
  const now = Date.now();

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : '--';

  const renderStatusBadge = (s: UserSession) => {
    const expired = s.expiresAt ? new Date(s.expiresAt).getTime() < now : false;
    const effectiveStatus = s.status || (s.revokedAt ? 'revoked' : expired ? 'expired' : 'active');
    const map: Record<string, { text: string; cls: string }> = {
      active: { text: s.isCurrent ? 'Şu An (Bu Cihaz)' : 'Aktif', cls: 'bg-green-100 text-green-600' },
      revoked: { text: 'İptal', cls: 'bg-red-100 text-red-600' },
      expired: { text: 'Süresi Doldu', cls: 'bg-gray-200 text-gray-600' }
    };
    const meta = map[effectiveStatus] || { text: effectiveStatus, cls: 'bg-gray-200 text-gray-600' };
    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${meta.cls}`}>{meta.text}</span>;
  };

  if (!sessions.length) {
    return <p className="text-xs text-gray-500">Hiç oturum bulunamadı.</p>;
  }

  return (
    <ul className="space-y-2 overflow-y-auto pr-1 text-xs max-h-72">
      {sessions.map(s => {
        const expired = s.expiresAt ? new Date(s.expiresAt).getTime() < now : false;
        const isActive = !s.revokedAt && !expired;
        const showConfirm = confirming === s.id;
        return (
          <li key={s.id} className={`group border border-gray-100 rounded-lg p-2 flex flex-col gap-1 transition ${s.revokedAt ? 'bg-red-50/30' : s.isCurrent ? 'bg-orange-50/60' : 'bg-gray-50/40'} hover:bg-gray-50`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  {renderStatusBadge(s)}
                  <span>{s.ip || 'IP yok'}</span>
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  {(s.browser || s.os || s.device) && (
                    <>
                      {s.browser && <span>{s.browser}</span>}
                      {s.os && <span className="text-gray-400">• {s.os}</span>}
                      {s.device && <span className="text-gray-400">• {s.device}</span>}
                    </>
                  )}
                </span>
              </div>
              {isActive ? (
                showConfirm ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { revokeSession(s.id); setConfirming(null); }}
                      className="text-[10px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-medium"
                    >Onayla</button>
                    <button
                      onClick={() => setConfirming(null)}
                      className="text-[10px] px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 font-medium"
                    >İptal</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(s.id)}
                    className="opacity-0 group-hover:opacity-100 transition text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                  >Sonlandır</button>
                )
              ) : (
                <span className="text-[10px] text-gray-400">Pasif</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 items-center">
              <span className="min-w-[140px]">Başlangıç: <span className="text-gray-700 font-medium">{formatDate(s.createdAt)}</span></span>
              <span className="min-w-[140px]">Bitiş: <span className="text-gray-700 font-medium">{formatDate(s.expiresAt)}</span></span>
              <button
                type="button"
                onClick={() => setExpandedUA(expandedUA === s.id ? null : s.id)}
                className="text-[10px] underline text-gray-600 hover:text-gray-800"
              >{expandedUA === s.id ? 'UserAgent Gizle' : 'UserAgent Göster'}</button>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(s.id); }}
                className="text-[10px] underline text-gray-400 hover:text-gray-600"
              >ID Kopyala</button>
            </div>
            {expandedUA === s.id && s.userAgent && (
              <div className="text-[10px] text-gray-600 bg-white/70 border border-gray-100 rounded p-2 break-all">
                {s.userAgent}
              </div>
            )}
            {s.revokedAt && (
              <div className="text-[10px] text-red-600 flex items-center gap-2">
                <span>İptal: {formatDate(s.revokedAt)}</span>
                {s.revokedReason && <span className="text-red-500/70">({s.revokedReason})</span>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const Profile: React.FC = () => {
  const { profile, fetchProfile, loadingProfile, error, updateProfile, updatePreferences, updating, uploadAvatar, uploadingAvatar, sessions, refreshSessions, revokeSession, bulkRevokeOtherSessions, loadingSessions, startMFA, verifyMFA, disableMFA, changePassword } = useProfile() as any;
  const { showNotification } = useNotification();
  type PrefDraft = {
    theme: ProfileThemePreference;
    density: ProfileDensityPreference;
    locale: string;
    timeZone: string;
    notifications: { email: boolean; sms: boolean; push: boolean };
  };

  const [prefDraft, setPrefDraft] = useState<PrefDraft>({
    theme: 'light',
    density: 'comfortable',
    locale: 'tr-TR',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: { email: true, sms: false, push: true }
  });
  const [prefDirty, setPrefDirty] = useState(false);
  useEffect(() => {
    // provider returns flat fields (theme, density, locale, timeZone, notificationEmail, notificationPush)
    if (profile) {
      setPrefDraft({
        theme: (profile.theme as any) || 'light',
        density: (profile.density as any) || 'comfortable',
        locale: (profile.locale as any) || 'tr-TR',
        timeZone: (profile.timeZone as any) || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: {
          email: (profile.notificationEmail ?? true) as boolean,
          sms: false,
          push: (profile.notificationPush ?? true) as boolean
        }
      });
      setPrefDirty(false);
    }
  }, [profile]);

  const setPrefField = (k: keyof typeof prefDraft, v: any) => {
    setPrefDraft(prev => ({ ...prev, [k]: v }));
    setPrefDirty(true);
  };
  const setPrefNotif = (k: keyof typeof prefDraft.notifications, v: boolean) => {
    setPrefDraft(prev => ({ ...prev, notifications: { ...prev.notifications, [k]: v } }));
    setPrefDirty(true);
  };

  const handlePrefSave = async () => {
    // map draft to provider's expected flat shape
    await updatePreferences({
      theme: prefDraft.theme as any,
      density: prefDraft.density as any,
      locale: prefDraft.locale,
      timeZone: prefDraft.timeZone,
      notificationEmail: prefDraft.notifications.email,
      notificationPush: prefDraft.notifications.push
    } as any);
    setPrefDirty(false);
  };

  // MFA Wizard State
  const [mfaStep, setMfaStep] = useState<'idle' | 'qr' | 'recovery'>('idle');
  const [qrData, setQrData] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [securityMsg, setSecurityMsg] = useState<string | null>(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', repeat: '' });
  const [pwDirty, setPwDirty] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const passwordValid = pwForm.newPassword.length >= 10 && /[A-Z]/.test(pwForm.newPassword) && /[a-z]/.test(pwForm.newPassword) && /\d/.test(pwForm.newPassword);
  const pwMismatch = pwForm.newPassword !== pwForm.repeat;

  const startMfaFlow = async () => {
    setSecurityMsg(null);
    const res = await startMFA();
    if (res) {
      setQrData(res.qrSvgData || res.otpauthUrl);
      setMfaStep('qr');
    } else {
      setSecurityMsg(error || 'MFA başlatılamadı');
    }
  };
  const verifyMfaFlow = async () => {
    if (!otpCode.trim()) return;
    const codes = await verifyMFA(otpCode.trim());
    if (codes) {
      setRecoveryCodes(codes);
      setMfaStep('recovery');
      setOtpCode('');
    }
  };
  const disableMfaFlow = async () => {
    setSecurityMsg(null);
    await disableMFA();
    if (error) {
      setSecurityMsg(error);
      return;
    }
    setMfaStep('idle');
    setQrData(null);
    setRecoveryCodes(null);
  };
  const copyRecovery = () => {
    if (!recoveryCodes) return;
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setSecurityMsg('Recovery kodları kopyalandı');
  };
  const resetMfaState = () => {
    setMfaStep('idle');
    setQrData(null);
    setRecoveryCodes(null);
    setOtpCode('');
  };

  // Password change handlers
  const setPwField = (k: keyof typeof pwForm, v: string) => {
    setPwForm(prev => ({ ...prev, [k]: v }));
    setPwDirty(true);
    setPwError(null);
  };
  const handlePasswordChange = async () => {
    if (!passwordValid) { setPwError('Parola gereksinimlerini karşılamıyor'); return; }
    if (pwMismatch) { setPwError('Parolalar eşleşmiyor'); return; }
    await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
    setPwDirty(false);
    setPwForm({ currentPassword: '', newPassword: '', repeat: '' });
    setSecurityMsg('Parola güncellendi');
  };
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [editMode, setEditMode] = useState(false);
  // provider uses username / email (flat). adapt form to edit those fields
  const [form, setForm] = useState<{ username: string; email?: string | null; name?: string | null; surname?: string | null }>({ username: '', email: '', name: '', surname: '' });
  const [dirty, setDirty] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string | null; surname?: string | null; email?: string | null }>({});

  // Ensure we request the latest profile on mount (do not rely solely on profile state)
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Activity log is temporarily disabled (handled in UI)

  useEffect(() => {
    if (profile) {
      setForm({
        username: (profile.username ?? (profile as any).displayName) || '',
        email: profile.email ?? '',
        name: (profile.name ?? null) || ((profile as any).displayName ? String((profile as any).displayName).split(' ')[0] : ''),
        surname: (profile.surname ?? null) || ((profile as any).displayName ? String((profile as any).displayName).split(' ').slice(1).join(' ') : '')
      });
      // validate initial values
      const { errors } = validateForm({
        username: (profile.username ?? (profile as any).displayName) || '',
        email: profile.email ?? '',
        name: (profile.name ?? null) || ((profile as any).displayName ? String((profile as any).displayName).split(' ')[0] : ''),
        surname: (profile.surname ?? null) || ((profile as any).displayName ? String((profile as any).displayName).split(' ').slice(1).join(' ') : '')
      });
      setFormErrors(errors);
      setDirty(false);
    }
  }, [profile]);

  // validation helper matching DTO constraints
  function validateForm(f: { username: string; email?: string | null; name?: string | null; surname?: string | null }) {
    const errors: any = {};
    if (f.name && String(f.name).trim().length > 100) errors.name = 'En fazla 100 karakter olmalı';
    if (f.surname && String(f.surname).trim().length > 100) errors.surname = 'En fazla 100 karakter olmalı';
    if (f.email) {
      const email = String(f.email).trim();
      if (email.length > 190) errors.email = 'En fazla 190 karakter olmalı';
      // simple email regex
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Geçersiz e-posta adresi';
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }

  const setField = (k: keyof typeof form, v: string) => {
    const newForm = { ...form, [k]: v };
    setForm(newForm);
    setDirty(true);
    const { errors } = validateForm(newForm);
    setFormErrors(errors);
  };
  const formValid = Object.keys(formErrors).length === 0;

  const handleSave = async () => {
    // validate before save
    const { valid, errors } = validateForm(form);
    if (!valid) { setFormErrors(errors); setDirty(true); return; }
    // map to backend DTO: name, surname, email
    const payload: any = {
      name: form.name ?? null,
      surname: form.surname ?? null,
      email: form.email ?? null
    };
    try {
      const res = await updateProfile(payload);
      // keep the UI in the updated state immediately
      setForm(prev => ({ ...prev, ...payload }));
      setDirty(false);
      setEditMode(false);
      showNotification('success', 'Profil bilgileri güncellendi');
      // refresh server state in background
      try { fetchProfile(); } catch (e) { /* ignore */ }
      return res;
    } catch (err: any) {
      showNotification('error', err?.message || 'Profil güncelleme hatası');
      throw err;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-gray-800">Profil</h1>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
          >Düzenle</button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditMode(false); if (profile) {
                  setForm({
                    username: profile.username || '', email: profile.email || '', name: profile.name ?? ((profile as any).displayName ? String((profile as any).displayName).split(' ')[0] : ''), surname: profile.surname ?? ((profile as any).displayName ? String((profile as any).displayName).split(' ').slice(1).join(' ') : '')
                  }); setDirty(false);
                }
              }}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >İptal</button>
            <button
              disabled={!dirty || updating || !formValid}
              onClick={handleSave}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${dirty && !updating && formValid ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >Kaydet</button>
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {/* Editable Info Card */}
        <div className="bg-white relative rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <InDevelopmentOverlay className='z-[1]' />

          {loadingProfile && !profile ? (
            <Skeleton className="h-24 w-24 rounded-full" />
          ) : (
            <>
              <div className="relative group">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg" />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {(profile?.username?.[0]?.toUpperCase()) || 'U'}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-medium bg-black/40 rounded-full text-white"
                >{uploadingAvatar ? 'Yükleniyor...' : 'Değiştir'}</button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                }}
              />
              <p className="mt-3 text-xs text-gray-500">PNG/JPG/WebP max 1MB</p>
            </>
          )}
        </div>
        <div className="md:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 min-w-0">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center justify-between">
            Kullanıcı Bilgileri {updating && <span className="text-xs text-orange-500 animate-pulse">Kaydediliyor...</span>}
          </h2>
          {loadingProfile && !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : profile ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <InputField label="Kullanıcı Adı" value={form.username} onChange={v => setField('username', v)} disabled={true} />
              <div>
                <InputField label="E-posta" value={form.email ?? ''} onChange={v => setField('email', v)} disabled={!editMode} />
                {formErrors.email && <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <InputField label="İsim" value={form.name ?? ''} onChange={v => setField('name', v)} disabled={!editMode} />
                {formErrors.name && <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <InputField label="Soyad" value={form.surname ?? ''} onChange={v => setField('surname', v)} disabled={!editMode} />
                {formErrors.surname && <p className="text-[11px] text-red-600 mt-1">{formErrors.surname}</p>}
              </div>
              <div className="col-span-2 text-xs text-gray-500 flex gap-6 mt-2">
                <span>Kullanıcı: {profile.username}</span>
                <span>Oluşturulma: {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '-'}</span>
                <span>Son Giriş: {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '-'}</span>
              </div>
            </div>
          ) : null}
        </div>

      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ">
        <div className="bg-white relative rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[140px] flex flex-col gap-3 sm:gap-4">
          <InDevelopmentOverlay />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Tercihler</h3>
            <button
              onClick={handlePrefSave}
              disabled={!prefDirty || updating}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${prefDirty && !updating ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >Kaydet</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-gray-600 font-medium">Tema</span>
              <select
                className="border border-gray-200 rounded-lg px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                value={prefDraft.theme}
                onChange={e => setPrefField('theme', e.target.value)}
              >
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
                <option value="system">Sistem</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-600 font-medium">Yoğunluk</span>
              <select
                className="border border-gray-200 rounded-lg px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                value={prefDraft.density}
                onChange={e => setPrefField('density', e.target.value)}
              >
                <option value="comfortable">Rahat</option>
                <option value="compact">Sıkı</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-600 font-medium">Dil</span>
              <select
                className="border border-gray-200 rounded-lg px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                value={prefDraft.locale}
                onChange={e => setPrefField('locale', e.target.value)}
              >
                <option value="tr-TR">Türkçe</option>
                <option value="en-US">English</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-600 font-medium">Zaman Dilimi</span>
              <input
                className="border border-gray-200 rounded-lg px-2 py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                value={prefDraft.timeZone}
                onChange={e => setPrefField('timeZone', e.target.value)}
              />
            </label>
          </div>
          <div className="mt-2 space-y-2">
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-2 flex flex-col gap-1 text-xs">
              <span>Dil: <b>{prefDraft.locale}</b></span>
              <span>Zaman Dilimi: <b>{prefDraft.timeZone}</b></span>
              <span>
                Tarih/Saat örneği: <b>{new Date().toLocaleString(prefDraft.locale, { timeZone: prefDraft.timeZone })}</b>
              </span>
              <span>
                Örnek metin: {prefDraft.locale === 'en-US' ? 'Welcome!' : 'Hoş geldiniz!'}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Bildirimler</p>
            <div className="flex flex-col gap-2">
              {(['email', 'sms', 'push'] as const).map(key => (
                <label key={key} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs">
                  <span className="text-gray-600 font-medium">{key === 'email' ? 'E-posta' : key === 'sms' ? 'SMS' : 'Push'}</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-400 cursor-pointer"
                    checked={prefDraft.notifications[key]}
                    onChange={e => setPrefNotif(key, e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-auto">Tema uygulaması (dark mode) ilerleyen adımda etkinleşecek.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[140px] flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Aktif Oturumlar</h3>
            <div className="flex items-center gap-2">
              <BulkRevokeOtherSessionsButton bulkRevokeOtherSessions={bulkRevokeOtherSessions} sessions={sessions || []} />
              <button
                onClick={() => refreshSessions()}
                className="text-[11px] px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium"
              >Yenile</button>
            </div>
          </div>
          {loadingSessions ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <SessionsList sessions={(sessions || []) as UserSession[]} revokeSession={revokeSession} />
          )}
        </div>
        <div className="bg-white relative rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[140px] flex flex-col gap-3 sm:gap-4 min-w-0">
          <InDevelopmentOverlay />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">MFA / Güvenlik</h3>
            {securityMsg && <span className="text-[10px] text-green-600">{securityMsg}</span>}
          </div>
          {/* MFA Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-gray-600">Durum:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${profile?.mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>{profile?.mfaEnabled ? 'Aktif' : 'Pasif'}</span>
            </div>
            {mfaStep === 'idle' && !profile?.mfaEnabled && (
              <button onClick={startMfaFlow} className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition">MFA Etkinleştir</button>
            )}
            {profile?.mfaEnabled && mfaStep === 'idle' && (
              <button onClick={disableMfaFlow} className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">MFA Devre Dışı Bırak</button>
            )}
            {mfaStep === 'qr' && (
              <div className="flex flex-col items-center gap-3">
                {qrData ? <SafeQRCode qrCode={qrData} className="w-40 h-40 object-contain" /> : <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">QR Yok</div>}
                <input value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="OTP Kodu" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs" />
                <div className="flex gap-2 w-full">
                  <button onClick={verifyMfaFlow} disabled={!otpCode.trim()} className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition ${otpCode.trim() ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Doğrula</button>
                  <button onClick={resetMfaState} className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">İptal</button>
                </div>
                <p className="text-[10px] text-gray-500 text-center">Authenticator uygulamasında (Google / Microsoft) taratın ve OTP girin.</p>
              </div>
            )}
            {mfaStep === 'recovery' && recoveryCodes && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Recovery Kodları</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-gray-50 p-3 rounded border border-gray-100">
                  {recoveryCodes.map(c => <span key={c} className="font-mono tracking-wide">{c}</span>)}
                </div>
                <div className="flex gap-2">
                  <button onClick={copyRecovery} className="flex-1 text-xs font-medium px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition">Kopyala</button>
                  <button onClick={resetMfaState} className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">Bitti</button>
                </div>
                <p className="text-[10px] text-gray-500">Bu kodları güvenli bir yerde saklayın. Tekrar gösterilmeyecek.</p>
              </div>
            )}
          </div>
          <div className="h-px bg-gray-100 my-2" />
          {/* Password Change */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700">Parola Değiştir</p>
            {pwError && <div className="text-[11px] text-red-600">{pwError}</div>}
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwField('currentPassword', e.target.value)} placeholder="Mevcut Parola" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs" />
            <input type="password" value={pwForm.newPassword} onChange={e => setPwField('newPassword', e.target.value)} placeholder="Yeni Parola (10+ karmaşık)" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs" />
            <input type="password" value={pwForm.repeat} onChange={e => setPwField('repeat', e.target.value)} placeholder="Yeni Parola Tekrar" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs" />
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span className={passwordValid ? 'text-green-600' : ''}>{passwordValid ? 'Güçlü' : 'En az 10 karakter, büyük/küçük harf ve rakam'}</span>
              {pwMismatch && <span className="text-red-600">Eşleşmiyor</span>}
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={!pwDirty || !passwordValid || pwMismatch}
              className={`w-full text-xs font-medium px-3 py-2 rounded-lg transition ${(pwDirty && passwordValid && !pwMismatch) ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >Parolayı Güncelle</button>
          </div>
        </div>
      </div>
      <ActivityLog />
    </div>
  );
};

const BulkRevokeOtherSessionsButton: React.FC<{ sessions: UserSession[]; bulkRevokeOtherSessions: () => Promise<{ revoked: number; errors: number }> }> = ({ sessions, bulkRevokeOtherSessions }) => {
  const [mode, setMode] = useState<'idle' | 'confirm' | 'working' | 'done'>('idle');
  const [result, setResult] = useState<{ revoked: number; errors: number } | null>(null);
  const now = Date.now();
  const activeCount = sessions.filter(s => !s.revokedAt && (!s.expiresAt || new Date(s.expiresAt).getTime() > now)).length;
  if (activeCount <= 1) return null; // only current
  const handle = async () => {
    setMode('working');
    const res = await bulkRevokeOtherSessions();
    setResult(res);
    setMode('done');
    setTimeout(() => setMode('idle'), 2500);
  };
  if (mode === 'idle') {
    return (
      <button
        onClick={() => setMode('confirm')}
        className="text-[11px] px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-medium"
      >Diğerlerini Kapat</button>
    );
  }
  if (mode === 'confirm') {
    return (
      <div className="flex items-center gap-1 text-[10px]">
        <button onClick={handle} className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-semibold">Onayla</button>
        <button onClick={() => setMode('idle')} className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 font-medium">İptal</button>
      </div>
    );
  }
  if (mode === 'working') {
    return <span className="text-[10px] text-orange-600 animate-pulse">İşleniyor...</span>;
  }
  return (
    <span className="text-[10px] text-green-600">{result?.revoked || 0} kapatıldı{result?.errors ? `, ${result.errors} hata` : ''}</span>
  );
};

import { ActivityProvider } from '@/context/provider/ActivityProvider';

const ProfilePage: React.FC = () => (
  <ActivityProvider>
    <Profile />
  </ActivityProvider>
);

export default ProfilePage;
