import { useEffect, useRef, useState } from 'react';
import { formatDateDisplay, normalizeDateKey } from '../utils/dateUtils';
import { addEntry, updateEntry, deleteEntry } from '../services/entryService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES, ALLOWED_USERS } from '../config/appConfig';
import { normalizeMemoryTagId } from '../config/memoryTags';
import { getErrorMessage } from '../utils/errorUtils';
import EntryCard from './EntryCard';
import EntryForm from './EntryForm';
import EmptyState from './EmptyState';

export default function DayDetailPanel({
  dateKey,
  entries,
  loading,
  loadError = null,
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
  const [isSaving, setIsSaving] = useState(false);
  const saveLockRef = useRef(false);

  const safeDateKey = normalizeDateKey(dateKey);
  const formId = `entry-form-${(safeDateKey || dateKey || 'memory').replace(/[^a-zA-Z0-9_-]/g, '-')}`;
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
    const id = window.setTimeout(() => {
      setEditingEntry(null);
      setSaveError('');
      setShowForm(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [openComposerSignal]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  async function handleSave(data) {
    if (saveLockRef.current) return;
    setSaveError('');
    if (!safeDateKey) {
      setSaveError('Geçersiz tarih. Lütfen günü yeniden seç.');
      return;
    }
    if (!user?.uid || !user?.email) {
      setSaveError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yap.');
      return;
    }
    saveLockRef.current = true;
    setIsSaving(true);
    const profile = USER_PROFILES[user.email];
    const normalizedDate = safeDateKey;
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
        setSuccessMessage('Anı güncellendi.');
      } else {
        await addEntry(entryData);
        setSuccessMessage('Yeni anı eklendi.');
      }
      setShowForm(false);
      setEditingEntry(null);
      onRefresh();
    } catch (err) {
      console.error('[FIRESTORE_CREATE_ERROR]', getErrorMessage(err));
      setSaveError('Anı kaydedilemedi. Lütfen tekrar dene.');
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleDelete(entryId) {
    try {
      await deleteEntry(entryId);
      onRefresh();
    } catch (err) {
      console.error('[FIRESTORE_DELETE_ERROR]', getErrorMessage(err));
    }
  }

  async function handleToggleFavorite(entry) {
    try {
      await updateEntry(entry.id, { favorite: !entry.favorite });
      onRefresh();
    } catch (err) {
      console.error('[FIRESTORE_UPDATE_ERROR] favorite:', getErrorMessage(err));
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
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 lightbox-overlay">
      <div
        className="bg-lb-surface w-full sm:max-w-4xl rounded-t-[2rem] sm:rounded-[1.5rem] shadow-book border border-lb-border flex flex-col max-h-[100dvh] sm:max-h-[90dvh] ring-1 ring-lb-accent/15"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="shrink-0 bg-lb-canvas/90">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4">
            <h2 className="font-display text-xl text-lb-text">{formatDateDisplay(dateKey)}</h2>
            <div className="flex items-center gap-3">
              {!showForm && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setSaveError('');
                    setShowForm(true);
                  }}
                  className="text-sm lb-btn-primary rounded-full px-4 min-h-[44px] active:scale-[0.98]"
                >
                  + Anı ekle
                </button>
              )}
              {showForm && (
                <button
                  type="submit"
                  form={formId}
                  disabled={isSaving}
                  className="text-sm lb-btn-primary rounded-full px-4 min-h-[44px] disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSaving ? 'Kaydediliyor…' : editingEntry ? 'Güncelle' : 'Kaydet'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-lb-subtext hover:text-lb-accent text-2xl w-11 h-11 rounded-full hover:bg-lb-elevated transition flex items-center justify-center active:scale-[0.98]"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
          </div>
          <div className="h-px w-full" style={{ background: 'var(--lb-gold-line)' }} />
        </div>

        {successMessage && (
          <div className="px-4 pt-3 shrink-0">
            <p className="text-sm text-lb-accent bg-lb-accent/10 border border-lb-accent/30 rounded-2xl px-3 py-2">
              {successMessage}
            </p>
          </div>
        )}

        {loadError && !loading && (
          <div className="px-4 pt-3 shrink-0" role="alert">
            <div className="rounded-2xl border border-lb-danger/35 bg-lb-danger/10 px-3 py-2.5 text-xs text-lb-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={onRefresh}
                className="shrink-0 rounded-xl border border-lb-border bg-lb-elevated px-3 py-1.5 text-xs font-medium text-lb-accent active:scale-[0.98]"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="px-4 sm:px-5 py-4 border-b border-lb-border shrink-0 space-y-2 bg-lb-canvas/50">
            {saveError && (
              <p className="text-xs text-lb-danger bg-lb-danger/10 border border-lb-danger/30 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}
            <EntryForm
              dateKey={safeDateKey || dateKey}
              userId={user?.uid ?? ''}
              onSave={handleSave}
              onCancel={cancelForm}
              initial={editingEntry}
              formId={formId}
              hideSubmitButton
              externalSaving={isSaving}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-lb-page/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
              <div
                className="w-10 h-10 border-[3px] border-lb-border border-t-lb-accent rounded-full animate-spin"
                aria-hidden
              />
              <p className="text-lb-text text-sm text-center font-hero-sub">Anılar yükleniyor…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-lb-border">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2 rounded-2xl bg-lb-elevated border border-lb-border px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-lb-accent text-lb-page text-xs font-bold flex items-center justify-center">
                    {leftProfile.displayName?.[0] ?? 'A'}
                  </div>
                  <span className="text-xs font-semibold text-lb-text uppercase tracking-wide">
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

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2 rounded-2xl bg-lb-elevated border border-lb-border px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-lb-accent2 text-white text-xs font-bold flex items-center justify-center">
                    {rightProfile.displayName?.[0] ?? 'T'}
                  </div>
                  <span className="text-xs font-semibold text-lb-text uppercase tracking-wide">
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
