import React, { useEffect, useState } from 'react';
import { useProfile } from '@/context/provider/ProfileProvider';
import { SafeQRCode } from '@/components/SafeQRCode';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, disabled }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-gray-600 font-medium">{label}</span>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white disabled:opacity-60"
    />
  </label>
);

const Profile: React.FC = () => {
  const { profile, fetchProfile, loadingProfile, error, updateProfile, updatePreferences, updating, uploadAvatar, uploadingAvatar, sessions, refreshSessions, revokeSession, loadingSessions, activity, loadMoreActivity, hasMoreActivity, loadingActivity, startMFA, verifyMFA, disableMFA, changePassword } = useProfile() as any;
  // Preferences draft
  const [prefDraft, setPrefDraft] = useState({
    theme: 'light',
    density: 'comfortable',
    locale: 'tr-TR',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: { email: true, sms: false, push: true }
  });
  const [prefDirty, setPrefDirty] = useState(false);

  useEffect(() => {
    if (profile?.preferences) {
      setPrefDraft({
        theme: profile.preferences.theme || 'light',
        density: (profile.preferences as any).density || 'comfortable',
        locale: (profile.preferences as any).locale || 'tr-TR',
        timeZone: (profile.preferences as any).timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: {
          email: profile.preferences.notifications?.email ?? true,
          sms: profile.preferences.notifications?.sms ?? false,
            push: profile.preferences.notifications?.push ?? true,
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
    await updatePreferences({
      theme: prefDraft.theme as any,
      density: prefDraft.density as any,
      locale: prefDraft.locale,
      timeZone: prefDraft.timeZone,
      notifications: prefDraft.notifications
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
    try {
      setSecurityMsg(null);
      const res = await startMFA();
      if (res) {
        setQrData(res.qrSvgData || res.otpauthUrl);
        setMfaStep('qr');
      }
    } catch (e: any) {
      setSecurityMsg(e.message || 'MFA başlatılamadı');
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
    await disableMFA();
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
  const [form, setForm] = useState({ displayName: '', fullName: '', phone: '', positionTitle: '' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Initial activity load
  useEffect(() => {
    if (!activity?.length && !loadingActivity) {
      loadMoreActivity();
    }
  }, [activity?.length, loadingActivity, loadMoreActivity]);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        positionTitle: profile.positionTitle || ''
      });
      setDirty(false);
    }
  }, [profile]);

  const setField = (k: keyof typeof form, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const handleSave = async () => {
    await updateProfile(form);
    setEditMode(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Profil</h1>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
          >Düzenle</button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditMode(false); if (profile) { setForm({
                displayName: profile.displayName || '', fullName: profile.fullName || '', phone: profile.phone || '', positionTitle: profile.positionTitle || ''
              }); setDirty(false);} }}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >İptal</button>
            <button
              disabled={!dirty || updating}
              onClick={handleSave}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${dirty && !updating ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >Kaydet</button>
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Editable Info Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Görünen Ad" value={form.displayName} onChange={v => setField('displayName', v)} disabled={!editMode} />
              <InputField label="Ad Soyad" value={form.fullName} onChange={v => setField('fullName', v)} disabled={!editMode} />
              <InputField label="Telefon" value={form.phone} onChange={v => setField('phone', v)} disabled={!editMode} />
              <InputField label="Pozisyon" value={form.positionTitle} onChange={v => setField('positionTitle', v)} disabled={!editMode} />
              <div className="col-span-2 text-xs text-gray-500 flex gap-6 mt-2">
                <span>Roller: {profile.roles.join(', ')}</span>
                <span>Durum: {profile.status}</span>
                <span>MFA: {profile.mfaEnabled ? 'Aktif' : 'Pasif'}</span>
              </div>
            </div>
          ) : null}
        </div>
        {/* Avatar Card */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          {loadingProfile && !profile ? (
            <Skeleton className="h-24 w-24 rounded-full" />
          ) : (
            <>
              <div className="relative group">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {profile?.displayName?.[0]?.toUpperCase() || 'U'}
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
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[140px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Tercihler</h3>
            <button
              onClick={handlePrefSave}
              disabled={!prefDirty || updating}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${prefDirty && !updating ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >Kaydet</button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
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
            {/* Locale ve TimeZone uygulama örneği */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-2 flex flex-col gap-1 text-xs">
              <span className="font-semibold text-orange-700">Canlı Dil ve Zaman Dilimi Uygulaması</span>
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
              {(['email','sms','push'] as const).map(key => (
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[140px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Aktif Oturumlar</h3>
            <button
              onClick={() => refreshSessions()}
              className="text-[11px] px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium"
            >Yenile</button>
          </div>
          {loadingSessions ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : sessions?.length ? (
            <ul className="space-y-2 overflow-y-auto pr-1 text-xs">
              {sessions.map((s: any) => (
                <li key={s.id} className="group border border-gray-100 rounded-lg p-2 flex flex-col gap-1 bg-gray-50/40 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      {s.current && <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 text-[10px] font-semibold">ŞU AN</span>}
                      {s.ip || 'IP unknown'}
                    </span>
                    {!s.current && (
                      <button
                        onClick={() => revokeSession(s.id)}
                        className="opacity-0 group-hover:opacity-100 transition text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                      >Sonlandır</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-500">
                    <span>Başlangıç: {s.issuedAt?.slice(11,16) || '--:--'}</span>
                    <span>Son: {s.lastSeenAt?.slice(11,16) || '--:--'}</span>
                    {s.userAgent && <span className="truncate max-w-[100px]">{s.userAgent.slice(0,18)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">Aktif oturum bulunamadı.</p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[140px] flex flex-col gap-4">
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
      {/* Activity Log */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Aktivite Kaydı</h3>
          <div className="flex items-center gap-2">
            {loadingActivity && <span className="text-[11px] text-orange-500 animate-pulse">Yükleniyor...</span>}
            {hasMoreActivity && (
              <button
                onClick={() => loadMoreActivity()}
                className="text-[11px] px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium"
              >Daha Fazla</button>
            )}
          </div>
        </div>
        {!activity?.length && !loadingActivity && (
          <p className="text-xs text-gray-500">Henüz aktivite bulunmuyor.</p>
        )}
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
          {activity.map((item: any) => {
            const badgeColor = item.type === 'LOGIN' ? 'bg-green-100 text-green-600' :
              item.type === 'LOGOUT' ? 'bg-gray-200 text-gray-600' :
              item.type === 'PASSWORD_CHANGE' ? 'bg-blue-100 text-blue-600' :
              item.type === 'MFA_ENABLE' ? 'bg-indigo-100 text-indigo-600' :
              item.type === 'MFA_DISABLE' ? 'bg-indigo-50 text-indigo-500' :
              item.type === 'SESSION_REVOKE' ? 'bg-red-100 text-red-600' :
              'bg-orange-100 text-orange-600';
            const time = item.createdAt?.slice(11,16) || '--:--';
            return (
              <li key={item.id} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/40 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${badgeColor}`}>{item.type}</span>
                  <span className="text-[10px] text-gray-500">{time}</span>
                </div>
                {item.meta?.detail && <p className="text-[11px] text-gray-600 line-clamp-2">{item.meta.detail}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-gray-400">
                  {item.ip && <span>IP {item.ip}</span>}
                  {item.userAgent && <span className="truncate max-w-[110px]">{item.userAgent.slice(0,25)}</span>}
                </div>
              </li>
            );
          })}
          {loadingActivity && activity?.length > 0 && (
            <li className="text-[11px] text-gray-500 text-center py-2">Yükleniyor...</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
