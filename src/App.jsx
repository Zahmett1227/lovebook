import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_YEAR, MIN_YEAR } from './config/appConfig';
import { getMemoryTagById, normalizeMemoryTagId } from './config/memoryTags';
import { normalizeDateKey, todayKey } from './utils/dateUtils';
import { normalizeVideoItems, resolveImageUrl } from './utils/imageUtils';
import { bytesToMb } from './utils/costUtils';
import { getErrorMessage, firestoreUserMessage } from './utils/errorUtils';
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
import OfflineBanner from './components/OfflineBanner';

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
  const [recentListError, setRecentListError] = useState(null);
  const [reviewListError, setReviewListError] = useState(null);
  const [showSessionCost, setShowSessionCost] = useState(false);
  const [sessionCostPreview, setSessionCostPreview] = useState({
    totalBytes: 0,
    storageUsd: 0,
    operationUsd: 0,
    totalUsd: 0,
    uploadOps: 0,
  });
  const pendingYear = useRef(null);

  const { selectedDate, selectDate, clearDate } = useSelectedDate();
  const { entries: yearEntries, datesWithContent, refresh: refreshYear, loadError: yearLoadError } =
    useYearEntries(year);
  const { entries: dayEntries, loading: dayLoading, loadError: dayLoadError, refresh: refreshDay } =
    useDayEntries(selectedDate);

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
    setRecentListError(null);
    try {
      const docs = await getLatestEntries(120);
      setRecentEntries(docs);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getLatestEntries:', getErrorMessage(err));
      setRecentListError(firestoreUserMessage(err));
    } finally {
      setRecentEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecentEntries();
  }, [refreshRecentEntries]);

  const resetReviewEntries = useCallback(async () => {
    setReviewListError(null);
    setReviewLoading(true);
    try {
      const { docs, cursor, hasMore } = await getEntriesPage({
        cursor: null,
        pageSize: 30,
      });
      setReviewEntries(docs);
      setReviewCursor(cursor);
      setReviewHasMore(hasMore);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getEntriesPage:', getErrorMessage(err));
      setReviewListError(firestoreUserMessage(err));
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const loadMoreReviewEntries = useCallback(async () => {
    if (!reviewCursor) return;
    setReviewLoadingMore(true);
    try {
      const { docs, cursor, hasMore } = await getEntriesPage({
        cursor: reviewCursor,
        pageSize: 30,
      });
      setReviewEntries((prev) => [...prev, ...docs]);
      setReviewCursor(cursor);
      setReviewHasMore(hasMore);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getEntriesPage:', getErrorMessage(err));
      setReviewListError(firestoreUserMessage(err));
    } finally {
      setReviewLoadingMore(false);
    }
  }, [reviewCursor]);

  useEffect(() => {
    if (viewMode !== 'review-mood') return;
    const id = window.setTimeout(() => {
      void resetReviewEntries();
    }, 0);
    return () => window.clearTimeout(id);
  }, [viewMode, resetReviewEntries]);

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
      <OfflineBanner />
      {/* Book title — LaunchMenu ile uyumlu sıcak editorial ton */}
      <div className="border-b border-[#ead4ce] bg-gradient-to-r from-[#fff9f8] via-[#fbeee8] to-[#f8e7df] py-3 px-4 text-center">
        <h1 className="font-hero-title text-2xl sm:text-3xl font-semibold text-[#5a3738] tracking-tight">
          LoveBook
        </h1>
        <p className="font-hero-sub text-[10px] text-[#a0726c] mt-1 uppercase tracking-[0.2em]">
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
              className="text-xs sm:text-sm border border-[#ead4ce] bg-white/90 hover:bg-[#fff6f3] text-[#6f4548] rounded-full px-3 py-2 min-h-[40px] transition active:scale-[0.98]"
            >
              Menüye Dön
            </button>
            <button
              onClick={openRandomMemory}
              disabled={randomLoading}
              className="text-xs sm:text-sm border border-[#ead4ce] bg-white/90 hover:bg-[#fff6f3] text-[#6f4548] rounded-full px-3 py-2 min-h-[40px] transition active:scale-[0.98] disabled:opacity-60"
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
            <div className="rounded-2xl border border-[#ead4ce] bg-white/80 p-3 shadow-editorial">
              <button
                type="button"
                onClick={() => setShowSessionCost((v) => !v)}
                className="w-full text-left text-xs font-semibold text-[#633f41] flex items-center justify-between gap-2 py-1 min-h-[40px]"
                aria-expanded={showSessionCost}
              >
                <span>Son oturum yüklemesi / tahmini maliyet</span>
                <span className="text-[#a0726c] shrink-0" aria-hidden>
                  {showSessionCost ? '▼' : '▶'}
                </span>
              </button>
              {showSessionCost && (
                <div className="rounded-xl border border-[#e7d3cb] bg-[#fffaf8] p-2 mb-3 mt-1">
                  <div className="flex items-center justify-between text-[11px] text-[#7a4f4f]">
                    <span>Son yükleme oturumu</span>
                    <span>{bytesToMb(sessionCostPreview.totalBytes).toFixed(2)} MB</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f0ded8] overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-[#8f5f5f]"
                      style={{ width: `${Math.min((bytesToMb(sessionCostPreview.totalBytes) / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8f6661] mt-1">
                    Depolama: ${sessionCostPreview.storageUsd.toFixed(4)} • İşlem: ${sessionCostPreview.operationUsd.toFixed(4)} • Toplam: ${sessionCostPreview.totalUsd.toFixed(4)}
                  </p>
                </div>
              )}
              <h3 className="text-sm font-semibold text-[#633f41] mb-2 mt-1">Son Anılar</h3>
              {recentListError && (
                <div
                  role="alert"
                  className="mb-2 rounded-xl border border-[#e7b8b0] bg-[#fff0ed] px-3 py-2 text-xs text-[#6b3a38] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <span>{recentListError}</span>
                  <button
                    type="button"
                    onClick={() => refreshRecentEntries()}
                    className="shrink-0 rounded-lg border border-[#ddbcb3] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6f4548]"
                  >
                    Tekrar dene
                  </button>
                </div>
              )}
              {recentEntriesLoading ? (
                <p className="text-xs text-[#8f6661]">Yükleniyor…</p>
              ) : latestEntries.length === 0 ? (
                <p className="text-xs text-[#8f6661]">Henüz anı eklenmedi.</p>
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
                        className="w-full text-left rounded-xl border border-[#ead8d1] bg-[#fffaf8] hover:bg-[#fff3ef] px-3 py-2 transition active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : previewVideo ? (
                            <div className="w-10 h-10 rounded-lg shrink-0 bg-[#f0ded8] text-[#7a4f4f] flex items-center justify-center text-[10px]">
                              VIDEO
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#9a726c]">
                              {entry.date} • {entry.userDisplayName}
                            </p>
                            <p className="text-xs text-[#5e3f3f] truncate">
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
              calendarLoadError={yearLoadError}
              onRetryCalendar={refreshYear}
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
          onLoadMore={loadMoreReviewEntries}
          activeTagFilter={activeTagFilter}
          onTagFilterChange={setActiveTagFilter}
          listError={reviewListError}
          onRetryList={resetReviewEntries}
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
          loadError={dayLoadError}
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
