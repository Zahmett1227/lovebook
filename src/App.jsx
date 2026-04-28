import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_YEAR, MIN_YEAR } from './config/appConfig';
import { getMemoryTagById, normalizeMemoryTagId } from './config/memoryTags';
import { normalizeDateKey } from './utils/dateUtils';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useYearEntries, useDayEntries } from './hooks/useEntries';
import { getAllEntries } from './services/entryService';
import ProtectedRoute from './components/ProtectedRoute';
import BookLayout from './components/BookLayout';
import YearNavigation from './components/YearNavigation';
import YearPage from './components/YearPage';
import DayDetailPanel from './components/DayDetailPanel';
import EmptyState from './components/EmptyState';

const ANIM_CLASS = {
  'exit-forward':  'page-exit-forward',
  'exit-back':     'page-exit-back',
  'enter-forward': 'page-enter-forward',
  'enter-back':    'page-enter-back',
};

function AppContent() {
  const [year, setYear]       = useState(INITIAL_YEAR);
  const [pageAnim, setPageAnim] = useState(null); // null | 'exit-forward' | 'exit-back' | 'enter-forward' | 'enter-back'
  const [activeTagFilter, setActiveTagFilter] = useState('all');
  const [allEntries, setAllEntries] = useState([]);
  const [allEntriesLoading, setAllEntriesLoading] = useState(false);
  const [randomStatus, setRandomStatus] = useState('');
  const [randomLoading, setRandomLoading] = useState(false);
  const pendingYear = useRef(null);

  const { selectedDate, selectDate, clearDate } = useSelectedDate();
  const { entries: yearEntries, datesWithContent, refresh: refreshYear } = useYearEntries(year);
  const { entries: dayEntries, loading: dayLoading, refresh: refreshDay } = useDayEntries(selectedDate);

  const entriesByDate = yearEntries.reduce((acc, entry) => {
    if (!entry?.date) return acc;
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const filteredEntriesByDate = useMemo(() => {
    if (activeTagFilter === 'all') return entriesByDate;
    return Object.entries(entriesByDate).reduce((acc, [date, entries]) => {
      const filtered = entries.filter(
        (entry) => normalizeMemoryTagId(entry.tag || entry.mood || null) === activeTagFilter
      );
      if (filtered.length > 0) acc[date] = filtered;
      return acc;
    }, {});
  }, [activeTagFilter, entriesByDate]);

  const filteredDatesWithContent = useMemo(
    () => new Set(Object.keys(filteredEntriesByDate)),
    [filteredEntriesByDate]
  );

  const latestEntries = useMemo(
    () =>
      [...allEntries]
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        .slice(0, 5),
    [allEntries]
  );

  const isAnimating = pageAnim !== null;

  function goNext() {
    if (isAnimating) return;
    pendingYear.current = year + 1;
    setPageAnim('exit-forward');
  }

  function goPrev() {
    if (isAnimating || year <= MIN_YEAR) return;
    pendingYear.current = year - 1;
    setPageAnim('exit-back');
  }

  function handleAnimEnd() {
    if (pageAnim === 'exit-forward') {
      setYear(pendingYear.current);
      setPageAnim('enter-forward');
    } else if (pageAnim === 'exit-back') {
      setYear(pendingYear.current);
      setPageAnim('enter-back');
    } else {
      // enter animation finished
      setPageAnim(null);
    }
  }

  function handleRefresh() {
    refreshYear();
    refreshDay();
    refreshAllEntries();
  }

  const refreshAllEntries = useCallback(async () => {
    setAllEntriesLoading(true);
    try {
      const docs = await getAllEntries();
      setAllEntries(docs);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getAllEntries:', err.message);
    } finally {
      setAllEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllEntries();
  }, [refreshAllEntries]);

  useEffect(() => {
    if (!randomStatus) return;
    const timer = window.setTimeout(() => setRandomStatus(''), 2600);
    return () => window.clearTimeout(timer);
  }, [randomStatus]);

  async function openRandomMemory() {
    setRandomLoading(true);
    try {
      const docs = allEntries.length > 0 ? allEntries : await getAllEntries();
      if (!docs.length) {
        setRandomStatus('Henüz hiç anı yok. İlk anıyı ekleyerek başlayalım.');
        return;
      }
      const randomEntry = docs[Math.floor(Math.random() * docs.length)];
      const randomDate = normalizeDateKey(randomEntry.date);
      if (!randomDate) {
        setRandomStatus('Bu anı için geçerli bir tarih bulunamadı.');
        return;
      }
      const randomYear = Number(randomDate.split('-')?.[0]);
      if (Number.isFinite(randomYear) && randomYear !== year) {
        setYear(randomYear);
      }
      selectDate(randomDate);
    } catch (err) {
      console.error('[RANDOM_MEMORY_ERROR]', err.message);
      setRandomStatus('Rastgele anı açılamadı. Lütfen tekrar dene.');
    } finally {
      setRandomLoading(false);
    }
  }

  return (
    <BookLayout>
      {/* Book title */}
      <div className="border-b border-[#cbe3d5] bg-[#eef9f2] py-3 px-4 text-center">
        <h1 className="font-display text-2xl font-semibold text-[#174330] tracking-wide">
          LoveBook
        </h1>
        <p className="text-[10px] text-[#5d8f77] mt-0.5 uppercase tracking-widest">
          Bizim Günlüğümüz
        </p>
      </div>

      <YearNavigation
        year={year}
        onPrev={goPrev}
        onNext={goNext}
        disabled={isAnimating}
      />

      <div className="px-4 sm:px-6 pt-2 pb-1">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={openRandomMemory}
            disabled={randomLoading}
            className="text-xs sm:text-sm border border-[#cbe3d5] bg-white hover:bg-[#edf8f2] text-[#1f6b4b] rounded-full px-3 py-2 min-h-[40px] transition active:scale-[0.98] disabled:opacity-60"
          >
            {randomLoading ? 'Açılıyor…' : '🎲 Rastgele Anı'}
          </button>
        </div>
        {randomStatus && (
          <div className="mt-2">
            <EmptyState message={randomStatus} />
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 pt-2 pb-2">
        <div className="rounded-2xl border border-[#cbe3d5] bg-white/80 p-3">
          <h3 className="text-sm font-semibold text-[#1d5e43] mb-2">Son Anılar</h3>
          {allEntriesLoading ? (
            <p className="text-xs text-[#6b9c86]">Yükleniyor…</p>
          ) : latestEntries.length === 0 ? (
            <p className="text-xs text-[#6b9c86]">Henüz anı eklenmedi.</p>
          ) : (
            <div className="space-y-2">
              {latestEntries.map((entry) => {
                const normalizedTag = normalizeMemoryTagId(entry.tag || entry.mood || null);
                const tagMeta = getMemoryTagById(normalizedTag);
                const previewImage = entry.imageUrls?.[0];
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      const safeEntryDate = normalizeDateKey(entry.date);
                      const entryYear = Number(safeEntryDate?.split('-')?.[0]);
                      if (Number.isFinite(entryYear) && entryYear !== year) setYear(entryYear);
                      if (safeEntryDate) selectDate(safeEntryDate);
                    }}
                    className="w-full text-left rounded-xl border border-[#d7ebde] bg-[#fbfffc] hover:bg-[#eef9f2] px-3 py-2 transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      {previewImage && (
                        <img
                          src={typeof previewImage === 'object' ? previewImage.url : previewImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-[#6b9c86]">
                          {entry.date} • {entry.userDisplayName}
                        </p>
                        <p className="text-xs text-[#22533c] truncate">
                          {entry.text || entry.title || 'Metin yok'}
                        </p>
                      </div>
                      <span className="text-sm shrink-0">
                        {tagMeta?.emoji ?? '•'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Animated page wrapper */}
      <div
        className={ANIM_CLASS[pageAnim] ?? ''}
        onAnimationEnd={handleAnimEnd}
        style={{ willChange: 'transform, opacity' }}
      >
        <YearPage
          year={year}
          datesWithContent={activeTagFilter === 'all' ? datesWithContent : filteredDatesWithContent}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          entriesByDate={activeTagFilter === 'all' ? entriesByDate : filteredEntriesByDate}
          activeTagFilter={activeTagFilter}
          onTagFilterChange={setActiveTagFilter}
        />
      </div>

      {selectedDate && (
        <DayDetailPanel
          dateKey={selectedDate}
          entries={dayEntries}
          loading={dayLoading}
          onClose={clearDate}
          onRefresh={handleRefresh}
          activeTagFilter={activeTagFilter}
        />
      )}
    </BookLayout>
  );
}

export default function App() {
  return (
    <ProtectedRoute>
      <AppContent />
    </ProtectedRoute>
  );
}
