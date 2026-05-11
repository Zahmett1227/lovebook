import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_YEAR, MIN_YEAR } from './config/appConfig';
import { getMemoryTagById, normalizeMemoryTagId } from './config/memoryTags';
import { normalizeDateKey, todayKey } from './utils/dateUtils';
import { normalizeVideoItems, resolveImageUrl } from './utils/imageUtils';
import { bytesToMb } from './utils/costUtils';
import { getErrorMessage } from './utils/errorUtils';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useYearEntries, useDayEntries } from './hooks/useEntries';
import { getEntriesPage, getLatestEntries } from './services/entryService';
import ProtectedRoute from './components/ProtectedRoute';
import BookLayout from './components/BookLayout';
import YearNavigation from './components/YearNavigation';
import YearPage from './components/YearPage';
import DayDetailPanel from './components/DayDetailPanel';
import EmptyState from './components/EmptyState';
import LaunchMenu from './components/LaunchMenu';
import MoodReviewPanel from './components/MoodReviewPanel';

const ANIM_CLASS = {
  'exit-forward':  'page-exit-forward',
  'exit-back':     'page-exit-back',
  'enter-forward': 'page-enter-forward',
  'enter-back':    'page-enter-back',
};

function AppContent() {
  const [viewMode, setViewMode] = useState('launch'); // launch | calendar | review-date | review-mood
  const [year, setYear]       = useState(INITIAL_YEAR);
  const [pageAnim, setPageAnim] = useState(null); // null | 'exit-forward' | 'exit-back' | 'enter-forward' | 'enter-back'
  const [activeTagFilter, setActiveTagFilter] = useState('all');
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentEntriesLoading, setRecentEntriesLoading] = useState(false);
  const [reviewEntries, setReviewEntries] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewLoadingMore, setReviewLoadingMore] = useState(false);
  const [reviewCursor, setReviewCursor] = useState(null);
  const [reviewHasMore, setReviewHasMore] = useState(true);
  const [randomStatus, setRandomStatus] = useState('');
  const [randomLoading, setRandomLoading] = useState(false);
  const [sessionCostPreview, setSessionCostPreview] = useState({
    totalBytes: 0,
    storageUsd: 0,
    operationUsd: 0,
    totalUsd: 0,
    uploadOps: 0,
  });
  const pendingYear = useRef(null);

  const { selectedDate, selectDate, clearDate } = useSelectedDate();
  const { entries: yearEntries, datesWithContent, refresh: refreshYear } = useYearEntries(year);
  const { entries: dayEntries, loading: dayLoading, refresh: refreshDay } = useDayEntries(selectedDate);

  const entriesByDate = useMemo(
    () =>
      yearEntries.reduce((acc, entry) => {
        if (!entry?.date) return acc;
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
      }, {}),
    [yearEntries]
  );

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
      [...recentEntries]
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        .slice(0, 5),
    [recentEntries]
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
    const pending = pendingYear.current;
    if (pageAnim === 'exit-forward') {
      if (Number.isFinite(pending)) {
        setYear(pending);
      }
      pendingYear.current = null;
      setPageAnim('enter-forward');
    } else if (pageAnim === 'exit-back') {
      if (Number.isFinite(pending)) {
        setYear(pending);
      }
      pendingYear.current = null;
      setPageAnim('enter-back');
    } else {
      // enter animation finished
      setPageAnim(null);
    }
  }

  function handleRefresh() {
    refreshYear();
    refreshDay();
    refreshRecentEntries();
  }

  const refreshRecentEntries = useCallback(async () => {
    setRecentEntriesLoading(true);
    try {
      const docs = await getLatestEntries(120);
      setRecentEntries(docs);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getLatestEntries:', getErrorMessage(err));
    } finally {
      setRecentEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecentEntries();
  }, [refreshRecentEntries]);

  const loadReviewEntries = useCallback(async ({ reset = false } = {}) => {
    if (reset) {
      setReviewLoading(true);
    } else {
      setReviewLoadingMore(true);
    }
    try {
      const { docs, cursor, hasMore } = await getEntriesPage({
        cursor: reset ? null : reviewCursor,
        pageSize: 30,
      });
      setReviewEntries((prev) => (reset ? docs : [...prev, ...docs]));
      setReviewCursor(cursor);
      setReviewHasMore(hasMore);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getEntriesPage:', getErrorMessage(err));
    } finally {
      setReviewLoading(false);
      setReviewLoadingMore(false);
    }
  }, [reviewCursor]);

  useEffect(() => {
    if (viewMode !== 'review-mood') return;
    loadReviewEntries({ reset: true });
  }, [viewMode, loadReviewEntries]);

  useEffect(() => {
    function readSessionCost() {
      try {
        const raw = localStorage.getItem('lovebook-session-cost');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setSessionCostPreview({
          totalBytes: Number(parsed?.totalBytes) || 0,
          storageUsd: Number(parsed?.storageUsd) || 0,
          operationUsd: Number(parsed?.operationUsd) || 0,
          totalUsd: Number(parsed?.totalUsd) || 0,
          uploadOps: Number(parsed?.uploadOps) || 0,
        });
      } catch {
        // ignore malformed local storage
      }
    }
    readSessionCost();
    window.addEventListener('lovebook-session-cost-update', readSessionCost);
    return () => window.removeEventListener('lovebook-session-cost-update', readSessionCost);
  }, []);

  useEffect(() => {
    if (!randomStatus) return;
    const timer = window.setTimeout(() => setRandomStatus(''), 2600);
    return () => window.clearTimeout(timer);
  }, [randomStatus]);

  async function openRandomMemory() {
    setRandomLoading(true);
    try {
      const docs = recentEntries.length > 0 ? recentEntries : await getLatestEntries(120);
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
      console.error('[RANDOM_MEMORY_ERROR]', getErrorMessage(err));
      setRandomStatus('Rastgele anı açılamadı. Lütfen tekrar dene.');
    } finally {
      setRandomLoading(false);
    }
  }

  function openDateDetail(dateKey) {
    const safeDate = normalizeDateKey(dateKey);
    if (!safeDate) return;
    const entryYear = Number(safeDate.split('-')?.[0]);
    if (Number.isFinite(entryYear) && entryYear !== year) setYear(entryYear);
    if (selectedDate === safeDate) {
      clearDate();
      window.setTimeout(() => selectDate(safeDate), 0);
      return;
    }
    selectDate(safeDate);
  }

  function goToTodayComposer() {
    setViewMode('calendar');
    openDateDetail(todayKey());
  }

  function goToCalendarMode() {
    setViewMode('calendar');
  }

  function goToReviewDateMode() {
    setViewMode('review-date');
  }

  function goToReviewMoodMode() {
    setViewMode('review-mood');
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

      {viewMode !== 'launch' && (
        <div className="px-4 sm:px-6 pt-2 pb-1">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setViewMode('launch')}
              className="text-xs sm:text-sm border border-[#cbe3d5] bg-white hover:bg-[#edf8f2] text-[#1f6b4b] rounded-full px-3 py-2 min-h-[40px] transition active:scale-[0.98]"
            >
              Menüye Dön
            </button>
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
      )}

      {viewMode === 'launch' && (
        <LaunchMenu
          onAddToday={goToTodayComposer}
          onAddDifferentDate={goToCalendarMode}
          onReviewByDate={goToReviewDateMode}
          onReviewByMood={goToReviewMoodMode}
        />
      )}

      {(viewMode === 'calendar' || viewMode === 'review-date') && (
        <>
          <div className="px-4 sm:px-6 pt-2 pb-2">
            <div className="rounded-2xl border border-[#cbe3d5] bg-white/80 p-3">
              <h3 className="text-sm font-semibold text-[#1d5e43] mb-2">Blaze Yükleme Tahmini</h3>
              <div className="rounded-xl border border-[#d7ebde] bg-[#f7fcf9] p-2 mb-3">
                <div className="flex items-center justify-between text-[11px] text-[#2e664c]">
                  <span>Son yükleme oturumu</span>
                  <span>{bytesToMb(sessionCostPreview.totalBytes).toFixed(2)} MB</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#dbeee2] overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#2d7b58]"
                    style={{ width: `${Math.min((bytesToMb(sessionCostPreview.totalBytes) / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#4b7f66] mt-1">
                  Depolama: ${sessionCostPreview.storageUsd.toFixed(4)} • İşlem: ${sessionCostPreview.operationUsd.toFixed(4)} • Toplam: ${sessionCostPreview.totalUsd.toFixed(4)}
                </p>
              </div>
              <h3 className="text-sm font-semibold text-[#1d5e43] mb-2">Son Anılar</h3>
              {recentEntriesLoading ? (
                <p className="text-xs text-[#6b9c86]">Yükleniyor…</p>
              ) : latestEntries.length === 0 ? (
                <p className="text-xs text-[#6b9c86]">Henüz anı eklenmedi.</p>
              ) : (
                <div className="space-y-2">
                  {latestEntries.map((entry) => {
                    const normalizedTag = normalizeMemoryTagId(entry.tag || entry.mood || null);
                    const tagMeta = getMemoryTagById(normalizedTag);
                    const previewImage = resolveImageUrl(entry.imageUrls?.[0]);
                    const previewVideo = normalizeVideoItems(entry.videoUrls)[0];
                    return (
                      <button
                        key={entry.id}
                        onClick={() => openDateDetail(entry.date)}
                        className="w-full text-left rounded-xl border border-[#d7ebde] bg-[#fbfffc] hover:bg-[#eef9f2] px-3 py-2 transition active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : previewVideo ? (
                            <div className="w-10 h-10 rounded-lg shrink-0 bg-[#dcefe4] text-[#1f6b4b] flex items-center justify-center text-[10px]">
                              VIDEO
                            </div>
                          ) : null}
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
        </>
      )}

      {viewMode === 'review-mood' && (
        <MoodReviewPanel
          entries={reviewEntries}
          loading={reviewLoading}
          loadingMore={reviewLoadingMore}
          hasMore={reviewHasMore}
          onLoadMore={() => loadReviewEntries({ reset: false })}
          activeTagFilter={activeTagFilter}
          onTagFilterChange={setActiveTagFilter}
          onOpenDate={(dateKey) => {
            setViewMode('calendar');
            openDateDetail(dateKey);
          }}
        />
      )}

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
