import { useState } from 'react';
import { formatDateDisplay } from '../utils/dateUtils';
import { addEntry, updateEntry, deleteEntry } from '../services/entryService';
import { useAuth } from '../hooks/useAuth';
import { USER_PROFILES, ALLOWED_USERS } from '../config/appConfig';
import EntryCard from './EntryCard';
import EntryForm from './EntryForm';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DayDetailPanel({ dateKey, entries, loading, onClose, onRefresh }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saveError, setSaveError] = useState('');

  const [year, month, day] = dateKey.split('-').map(Number);

  const leftEmail  = ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'left');
  const rightEmail = ALLOWED_USERS.find((e) => USER_PROFILES[e]?.side === 'right');
  const leftProfile  = USER_PROFILES[leftEmail]  ?? { displayName: 'Kullanıcı 1' };
  const rightProfile = USER_PROFILES[rightEmail] ?? { displayName: 'Kullanıcı 2' };

  const leftEntries  = entries.filter((e) => e.userEmail === leftEmail);
  const rightEntries = entries.filter((e) => e.userEmail === rightEmail);

  async function handleSave(data) {
    setSaveError('');
    const profile = USER_PROFILES[user.email];
    const entryData = {
      date: dateKey, year, month, day,
      userId: user.uid,
      userEmail: user.email,
      userDisplayName: profile?.displayName ?? user.email,
      ...data,
    };

    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data);
      } else {
        await addEntry(entryData);
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
      <div className="bg-[#fdfaf5] w-full sm:max-w-3xl sm:rounded-2xl shadow-book border border-[#e0cdb8] flex flex-col max-h-screen sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d5c0] shrink-0">
          <h2 className="font-display text-lg font-semibold text-[#3d2b1f]">
            {formatDateDisplay(dateKey)}
          </h2>
          <div className="flex items-center gap-3">
            {!showForm && (
              <button
                onClick={() => { setEditingEntry(null); setSaveError(''); setShowForm(true); }}
                className="text-xs bg-[#a0704a] hover:bg-[#8a5e3c] text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                + Anı Ekle
              </button>
            )}
            <button onClick={onClose} className="text-[#b09080] hover:text-[#5c3d2a] text-xl leading-none">
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="px-5 py-4 border-b border-[#e8d5c0] shrink-0 space-y-2">
            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}
            <EntryForm
              dateKey={dateKey}
              userId={user.uid}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#e8d5c0]">
              {/* Left */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-[#6b5040] uppercase tracking-wide">
                    {leftProfile.displayName}
                  </span>
                </div>
                {leftEntries.length === 0
                  ? <EmptyState message="Henüz anı eklenmemiş." />
                  : leftEntries.map((e) => (
                      <EntryCard key={e.id} entry={e}
                        isOwner={user.email === e.userEmail}
                        onEdit={startEdit} onDelete={handleDelete} />
                    ))
                }
              </div>

              {/* Right */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-xs font-semibold text-[#6b5040] uppercase tracking-wide">
                    {rightProfile.displayName}
                  </span>
                </div>
                {rightEntries.length === 0
                  ? <EmptyState message="Henüz anı eklenmemiş." />
                  : rightEntries.map((e) => (
                      <EntryCard key={e.id} entry={e}
                        isOwner={user.email === e.userEmail}
                        onEdit={startEdit} onDelete={handleDelete} />
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
