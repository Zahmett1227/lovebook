import { useEffect, useState } from 'react';
import { formatDateDisplay, normalizeDateKey } from '../utils/dateUtils';
import { addEntry, updateEntry, deleteEntry } from '../services/entryService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES, ALLOWED_USERS } from '../config/appConfig';
import { normalizeMemoryTagId } from '../config/memoryTags';
import EntryCard from './EntryCard';
import EntryForm from './EntryForm';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DayDetailPanel({
  dateKey,
  entries,
  loading,
  onClose,
  onRefresh,
  openComposerSignal = 0,
  activeTagFilter = 'all',
}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const safeDateKey = normalizeDateKey(dateKey);
  const [year, month, day] = (safeDateKey || '1970-01-01').split('-').map(Number);
  const leftEmail  = ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'left');
  const rightEmail = ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'right');
  const leftProfile  = USER_PROFILES[leftEmail]  ?? { displayName: 'Kullanıcı 1' };
  const rightProfile = USER_PROFILES[rightEmail] ?? { displayName: 'Kullanıcı 2' };

  const tagFilteredEntries = activeTagFilter === 'all'
    ? entries
    : entries.filter(
        (e) => normalizeMemoryTagId(e.tag || e.mood || null) === activeTagFilter
      );

  const leftEntries  = tagFilteredEntries.filter((e) => e.userEmail === leftEmail);
  const rightEntries = tagFilteredEntries.filter((e) => e.userEmail === rightEmail);

  useEffect(() => {
    if (!openComposerSignal) return;
    setEditingEntry(null);
    setSaveError('');
    setShowForm(true);
  }, [openComposerSignal]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  async function handleSave(data) {
    setSaveError('');
    if (!user?.uid || !user?.email) {
      setSaveError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yap.');
      return;
    }
    const profile = USER_PROFILES[user.email];
    const normalizedDate = safeDateKey || dateKey;
    const entryData = {
      date: normalizedDate, year, month, day,
      userId: user.uid,
      userEmail: user.email,
      userDisplayName: profile?.displayName ?? user.email,
      ...data,
    };

    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data);
        setSuccessMessage('Ani guncellendi.');
      } else {
        await addEntry(entryData);
        setSuccessMessage('Yeni ani eklendi.');
      }
      setShowForm(false);
      setEditingEntry(null);
      // refresh is fire-and-forget; errors are handled inside useEntries
      onRefresh();
    } catch (err) {
      console.error('[FIRESTORE_CREATE_ERROR]', err.message);
      setSaveError('Anı kaydedilemedi. Lütfen tekrar dene.');
    }
  }

  async function handleDelete(entryId) {
    try {
      await deleteEntry(entryId);
      onRefresh();
    } catch (err) {
      console.error('[FIRESTORE_DELETE_ERROR]', err.message);
    }
  }

  async function handleToggleFavorite(entry) {
    try {
      await updateEntry(entry.id, { favorite: !entry.favorite });
      onRefresh();
    } catch (err) {
      console.error('[FIRESTORE_UPDATE_ERROR] favorite:', err.message);
    }
  }

  function startEdit(entry) {
    setSaveError('');
    setEditingEntry(entry);
    setShowForm(true);
  }

  function cancelForm() {
    setSaveError('');
    setShowForm(false);
    setEditingEntry(null);
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-[#f7fdf9] w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-book border border-[#cbe3d5] flex flex-col max-h-[100dvh] sm:max-h-[90dvh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#cbe3d5] shrink-0 bg-[#edf9f2]">
          <h2 className="font-display text-lg font-semibold text-[#174330]">
            {formatDateDisplay(dateKey)}
          </h2>
          <div className="flex items-center gap-3">
            {!showForm && (
              <button
                onClick={() => { setEditingEntry(null); setSaveError(''); setShowForm(true); }}
                className="text-sm bg-[#1f6b4b] hover:bg-[#195a40] text-white rounded-full px-4 min-h-[44px] active:scale-[0.98] transition"
              >
                + Anı Ekle
              </button>
            )}
            <button onClick={onClose} className="text-[#6e9f87] hover:text-[#1f6b4b] text-2xl leading-none w-11 h-11 rounded-full active:scale-[0.98] transition">
              ×
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="px-4 pt-3 shrink-0">
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2">
              {successMessage}
            </p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="px-4 sm:px-5 py-4 border-b border-[#cbe3d5] shrink-0 space-y-2 bg-white/80">
            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}
            <EntryForm
              dateKey={safeDateKey || dateKey}
              userId={user?.uid ?? ''}
              onSave={handleSave}
              onCancel={cancelForm}
              initial={editingEntry}
            />
          </div>
        )}

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingSpinner message="Anılar yükleniyor…" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#cbe3d5]">
              {/* Left */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2 rounded-2xl bg-gradient-to-r from-[#e8f6ee] to-[#e7f0ff] border border-[#c5e1d1] px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d7b58] to-[#3f8e6a] text-white text-xs flex items-center justify-center">
                    {leftProfile.displayName?.[0] ?? 'A'}
                  </div>
                  <span className="text-xs font-semibold text-[#2a5f45] uppercase tracking-wide">
                    {leftProfile.displayName}
                  </span>
                </div>
                {leftEntries.length === 0
                  ? <EmptyState message={activeTagFilter === 'all' ? 'Bu güne henüz anı bırakmamışız. İlk notu sen ekle.' : 'Bu etikete ait anı bulunamadı.'} />
                  : leftEntries.map((e) => (
                      <EntryCard key={e.id} entry={e}
                        isOwner={user?.email === e.userEmail}
                        onEdit={startEdit}
                        onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                }
              </div>

              {/* Right */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2 rounded-2xl bg-gradient-to-r from-[#e6f4ec] to-[#efe9ff] border border-[#c5e1d1] px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a9b76] to-[#629fda] text-white text-xs flex items-center justify-center">
                    {rightProfile.displayName?.[0] ?? 'T'}
                  </div>
                  <span className="text-xs font-semibold text-[#2a5f45] uppercase tracking-wide">
                    {rightProfile.displayName}
                  </span>
                </div>
                {rightEntries.length === 0
                  ? <EmptyState message={activeTagFilter === 'all' ? 'Bu güne henüz anı bırakmamışız. İlk notu sen ekle.' : 'Bu etikete ait anı bulunamadı.'} />
                  : rightEntries.map((e) => (
                      <EntryCard key={e.id} entry={e}
                        isOwner={user?.email === e.userEmail}
                        onEdit={startEdit}
                        onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
