import { useEffect, useMemo, useState } from 'react';
import { logout } from '../services/authService';
import {
  ALLOWED_USERS,
  RELATIONSHIP_START_DATE,
  USER_PROFILES,
  generateCoupleId,
} from '../config/appConfig';
import { useCoupleProfile } from '../hooks/useCoupleProfile';
import { daysTogetherCount } from '../utils/dateUtils';

export default function ProfileScreen({
  stats = { totalEntries: 0, totalPhotos: 0, totalVideos: 0 },
}) {
  const coupleId = useMemo(
    () => generateCoupleId(ALLOWED_USERS[0], ALLOWED_USERS[1]),
    []
  );
  const { profile, loading, saving, updateProfile } = useCoupleProfile(coupleId);

  const leftEmail = ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'left');
  const rightEmail = ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'right');
  const leftProfile = USER_PROFILES[leftEmail] ?? { displayName: 'Sol' };
  const rightProfile = USER_PROFILES[rightEmail] ?? { displayName: 'Sağ' };

  const [startDate, setStartDate] = useState(RELATIONSHIP_START_DATE);
  const [leftPhotoUrl, setLeftPhotoUrl] = useState('');
  const [rightPhotoUrl, setRightPhotoUrl] = useState('');

  useEffect(() => {
    if (!profile) return;
    setStartDate(profile.startDate || RELATIONSHIP_START_DATE);
    setLeftPhotoUrl(profile.leftUserPhotoUrl ?? '');
    setRightPhotoUrl(profile.rightUserPhotoUrl ?? '');
  }, [profile]);

  const dayCount = daysTogetherCount(startDate || RELATIONSHIP_START_DATE);

  const [editingUser, setEditingUser] = useState(null);

  async function handleSave() {
    await updateProfile({
      startDate,
      leftUserPhotoUrl: leftPhotoUrl.trim(),
      rightUserPhotoUrl: rightPhotoUrl.trim(),
      leftUserDisplayName: leftProfile.displayName,
      rightUserDisplayName: rightProfile.displayName,
    });
    setEditingUser(null);
  }

  return (
    <div className="min-h-[100dvh] bg-lb-page pb-28">
      <div className="relative bg-gradient-to-b from-lb-elevated to-lb-canvas pt-14 pb-8 px-6 overflow-hidden grain-overlay">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-lb-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-lb-accent2/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--lb-gold-line)' }} />

        <div className="flex items-center justify-center gap-4 mb-6">
          <ProfileAvatar
            photoUrl={leftPhotoUrl || profile?.leftUserPhotoUrl}
            displayName={leftProfile.displayName}
            side="left"
            onEdit={() => setEditingUser('left')}
          />
          <span className="text-3xl animate-pulse" aria-hidden>
            ♥
          </span>
          <ProfileAvatar
            photoUrl={rightPhotoUrl || profile?.rightUserPhotoUrl}
            displayName={rightProfile.displayName}
            side="right"
            onEdit={() => setEditingUser('right')}
          />
        </div>

        <div className="text-center">
          <p className="font-display text-3xl text-lb-accent">{dayCount}</p>
          <p className="font-hero-sub text-xs text-lb-subtext uppercase tracking-widest mt-1">gün birlikte</p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-3 stagger">
        {loading && <p className="text-sm text-lb-subtext text-center font-hero-sub">Profil yükleniyor…</p>}

        <div className="bg-lb-elevated rounded-2xl border border-lb-border p-4">
          <label className="block text-[10px] uppercase tracking-[0.16em] text-lb-subtext mb-2 font-hero-sub">
            Birlikte olduğunuz tarih
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="lb-input"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="bg-lb-elevated rounded-2xl border border-lb-border p-4">
          <label className="block text-[10px] uppercase tracking-[0.16em] text-lb-subtext mb-2 font-hero-sub">
            {leftProfile.displayName} — Profil fotoğrafı URL
          </label>
          <input
            type="url"
            value={leftPhotoUrl}
            onChange={(e) => setLeftPhotoUrl(e.target.value)}
            placeholder="https://…"
            className="lb-input"
          />
          {editingUser === 'left' && (
            <p className="text-[10px] text-lb-subtext mt-2 font-hero-sub">URL&apos;yi düzenleyip aşağıdan kaydedin.</p>
          )}
        </div>

        <div className="bg-lb-elevated rounded-2xl border border-lb-border p-4">
          <label className="block text-[10px] uppercase tracking-[0.16em] text-lb-subtext mb-2 font-hero-sub">
            {rightProfile.displayName} — Profil fotoğrafı URL
          </label>
          <input
            type="url"
            value={rightPhotoUrl}
            onChange={(e) => setRightPhotoUrl(e.target.value)}
            placeholder="https://…"
            className="lb-input"
          />
          {editingUser === 'right' && (
            <p className="text-[10px] text-lb-subtext mt-2 font-hero-sub">URL&apos;yi düzenleyip aşağıdan kaydedin.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="lb-btn-primary w-full min-h-[52px] text-base italic font-display active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor…' : 'Profili Güncelle'}
        </button>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { label: 'Toplam Anı', value: stats.totalEntries },
            { label: 'Fotoğraf', value: stats.totalPhotos },
            { label: 'Video', value: stats.totalVideos },
            { label: 'Şehir', value: '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-lb-elevated rounded-2xl border border-lb-border p-4 text-center"
            >
              <p className="font-display text-2xl text-lb-accent">{value}</p>
              <p className="font-hero-sub text-[10px] text-lb-subtext uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="lb-btn-ghost w-full min-h-[48px] text-sm text-lb-danger border-lb-danger/30 hover:border-lb-danger/60 mt-2 active:scale-[0.98]"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

function ProfileAvatar({ photoUrl, displayName, side, onEdit }) {
  const initial = displayName?.[0] ?? '?';
  return (
    <button type="button" onClick={onEdit} className="relative flex flex-col items-center gap-2 active:scale-[0.98]">
      <div
        className={`w-20 h-20 rounded-full overflow-hidden ring-4 transition ${
          side === 'left' ? 'ring-lb-accent/50' : 'ring-lb-accent2/50'
        }`}
      >
        {photoUrl ? (
          <img src={photoUrl} className="w-full h-full object-cover" alt="" />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-2xl font-display font-bold ${
              side === 'left' ? 'bg-lb-accent text-lb-page' : 'bg-lb-accent2 text-white'
            }`}
          >
            {initial}
          </div>
        )}
      </div>
      <span className="text-xs text-lb-subtext font-hero-sub">{displayName}</span>
      <span className="absolute bottom-6 right-0 w-6 h-6 rounded-full bg-lb-elevated border border-lb-border flex items-center justify-center text-[10px] pointer-events-none">
        ✎
      </span>
    </button>
  );
}
