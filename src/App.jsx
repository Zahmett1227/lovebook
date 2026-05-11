import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_YEAR, MIN_YEAR } from './config/appConfig';
import { getMemoryTagById, normalizeMemoryTagId } from './config/memoryTags';
import { normalizeDateKey, todayKey } from './utils/dateUtils';
import { normalizeImageUrls, normalizeVideoItems, resolveImageUrl } from './utils/imageUtils';
import { bytesToMb } from './utils/costUtils';
import { getErrorMessage, firestoreUserMessage } from './utils/errorUtils';
import { useAuth } from './hooks/useAuth';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useYearEntries, useDayEntries } from './hooks/useEntries';
import {
  getEntriesPage,
  getLatestEntries,
  getAllEntries,
  updateEntry,
  deleteEntry,
} from './services/entryService';
import { getCommentCount } from './services/commentService';
import ProtectedRoute from './components/ProtectedRoute';
import BookLayout from './components/BookLayout';
import YearNavigation from './components/YearNavigation';
import YearPage from './components/YearPage';
import DayDetailPanel from './components/DayDetailPanel';
import EmptyState from './components/EmptyState';
import LaunchMenu from './components/LaunchMenu';
import MoodReviewPanel from './components/MoodReviewPanel';
import OfflineBanner from './components/OfflineBanner';
import MemoryFeedScreen from './screens/MemoryFeedScreen';
import CommentsScreen from './screens/CommentsScreen';
import ProfileScreen from './screens/ProfileScreen';

const ANIM_CLASS = {
  'exit-forward':  'page-exit-forward',
  'exit-back':     'page-exit-back',
  'enter-forward': 'page-enter-forward',
  'enter-back':    'page-enter-back',
};

function AppContent() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('launch'); // launch | calendar | review-date | review-mood | feed | profile
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

  const [allEntries, setAllEntries] = useState([]);
  const [allEntriesLoading, setAllEntriesLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState({});
  const [commentEntry, setCommentEntry] = useState(null);

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
    void reloadAllEntries();
  }

  const mobileTab = useMemo(() => {
    if (viewMode === 'launch') return 'home';
    if (viewMode === 'calendar' || viewMode === 'review-date') return 'calendar';
    if (viewMode === 'feed') return 'memories';
    if (viewMode === 'profile') return 'profile';
    return null;
  }, [viewMode]);

  const feedEntries = useMemo(
    () => allEntries.map((e) => ({ ...e, commentCount: commentCounts[e.id] ?? 0 })),
    [allEntries, commentCounts]
  );

  const profileStats = useMemo(() => {
    const totalEntries = allEntries.length;
    const totalPhotos = allEntries.reduce((s, e) => s + normalizeImageUrls(e.imageUrls).length, 0);
    const totalVideos = allEntries.reduce((s, e) => s + normalizeVideoItems(e.videoUrls).length, 0);
    return { totalEntries, totalPhotos, totalVideos };
  }, [allEntries]);

  async function handleFeedFavorite(entry) {
    try {
      await updateEntry(entry.id, { favorite: !entry.favorite });
      setAllEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, favorite: !e.favorite } : e))
      );
      refreshYear();
      void refreshRecentEntries();
    } catch (err) {
      console.error('[updateEntry favorite]', getErrorMessage(err));
    }
  }

  async function handleFeedDelete(entryId) {
    try {
      await deleteEntry(entryId);
      setAllEntries((prev) => prev.filter((e) => e.id !== entryId));
      setCommentCounts((prev) => {
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
      refreshYear();
      void refreshRecentEntries();
      if (commentEntry?.id === entryId) setCommentEntry(null);
    } catch (err) {
      console.error('[deleteEntry]', getErrorMessage(err));
    }
  }

  function handleFeedEdit(entry) {
    setViewMode('calendar');
    openDateDetail(entry.date);
  }

  async function handleCommentCountRefresh(entryId) {
    try {
      const n = await getCommentCount(entryId);
      setCommentCounts((prev) => ({ ...prev, [entryId]: n }));
    } catch {
      // ignore
    }
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

  const reloadAllEntries = useCallback(async () => {
    setAllEntriesLoading(true);
    try {
      const data = await getAllEntries();
      setAllEntries(data);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getAllEntries:', getErrorMessage(err));
      setAllEntries([]);
    } finally {
      setAllEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecentEntries();
  }, [refreshRecentEntries]);

  useEffect(() => {
    void reloadAllEntries();
  }, [reloadAllEntries]);

  useEffect(() => {
    if (viewMode !== 'feed' || allEntries.length === 0) return;
    let cancelled = false;
    (async () => {
      const next = {};
      await Promise.all(
        allEntries.map(async (e) => {
          try {
            next[e.id] = await getCommentCount(e.id);
          } catch {
            next[e.id] = 0;
          }
        })
      );
      if (!cancelled) setCommentCounts(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [viewMode, allEntries]);

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
    <BookLayout
      mobileNav={{
        activeTab: mobileTab,
        onTab: (tabId) => {
          if (tabId === 'home') setViewMode('launch');
          else if (tabId === 'calendar') setViewMode('calendar');
          else if (tabId === 'memories') setViewMode('feed');
          else if (tabId === 'profile') setViewMode('profile');
        },
        onAdd: goToTodayComposer,
      }}
    >
      <OfflineBanner />
      <div className="border-b border-lb-border bg-gradient-to-r from-lb-canvas via-lb-elevated to-lb-canvas py-3.5 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lb-accent/40 to-transparent" />
        <h1 className="font-hero-title text-2xl sm:text-3xl font-semibold text-lb-text tracking-tight">
          LoveBook
        </h1>
        <p className="font-hero-sub text-[10px] text-lb-accent mt-1.5 uppercase tracking-[0.28em]">
          Bizim günlüğümüz
        </p>
      </div>

      {(viewMode === 'calendar' || viewMode === 'review-date') && (
        <YearNavigation
          year={year}
          onPrev={goPrev}
          onNext={goNext}
          disabled={isAnimating}
        />
      )}

      {viewMode !== 'launch' && viewMode !== 'feed' && viewMode !== 'profile' && (
        <>
          <div className="hidden md:block px-4 sm:px-6 pt-2 pb-1">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewMode('launch')}
                className="text-xs sm:text-sm border border-lb-border bg-lb-elevated hover:bg-lb-muted text-lb-text rounded-full px-4 py-2 min-h-[44px] transition active:scale-[0.98]"
              >
                Menüye dön
              </button>
              <button
                type="button"
                onClick={openRandomMemory}
                disabled={randomLoading}
                className="text-xs sm:text-sm border border-lb-accent/40 bg-lb-accent/15 hover:bg-lb-accent/25 text-lb-accent rounded-full px-4 py-2 min-h-[44px] transition active:scale-[0.98] disabled:opacity-50 font-medium"
              >
                {randomLoading ? 'Açılıyor…' : 'Rastgele anı'}
              </button>
            </div>
            {randomStatus && (
              <div className="mt-2">
                <EmptyState message={randomStatus} />
              </div>
            )}
          </div>
          {randomStatus && (
            <div className="md:hidden px-4 mt-1 pb-1">
              <EmptyState message={randomStatus} />
            </div>
          )}
        </>
      )}

      {viewMode === 'launch' && (
        <LaunchMenu
          entries={yearEntries}
          onAddToday={goToTodayComposer}
          onAddDifferentDate={goToCalendarMode}
          onReviewByDate={goToReviewDateMode}
          onReviewByMood={goToReviewMoodMode}
          onRandomMemory={openRandomMemory}
          randomLoading={randomLoading}
        />
      )}

      {(viewMode === 'calendar' || viewMode === 'review-date') && (
        <>
          <div className="px-4 sm:px-6 pt-2 pb-2">
            <div className="rounded-2xl border border-lb-border bg-lb-elevated/80 p-3 shadow-editorial ring-1 ring-white/[0.03]">
              <button
                type="button"
                onClick={() => setShowSessionCost((v) => !v)}
                className="w-full text-left text-xs font-semibold text-lb-text flex items-center justify-between gap-2 py-1 min-h-[40px]"
                aria-expanded={showSessionCost}
              >
                <span>Son oturum / tahmini maliyet</span>
                <span className="text-lb-accent shrink-0" aria-hidden>
                  {showSessionCost ? '▼' : '▶'}
                </span>
              </button>
              {showSessionCost && (
                <div className="rounded-xl border border-lb-border bg-lb-canvas p-2 mb-3 mt-1">
                  <div className="flex items-center justify-between text-[11px] text-lb-subtext">
                    <span>Son yükleme oturumu</span>
                    <span className="text-lb-text">{bytesToMb(sessionCostPreview.totalBytes).toFixed(2)} MB</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-lb-muted overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-lb-accent"
                      style={{ width: `${Math.min((bytesToMb(sessionCostPreview.totalBytes) / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-lb-subtext mt-1">
                    Depolama: ${sessionCostPreview.storageUsd.toFixed(4)} • İşlem: ${sessionCostPreview.operationUsd.toFixed(4)} • Toplam: ${sessionCostPreview.totalUsd.toFixed(4)}
                  </p>
                </div>
              )}
              <h3 className="text-sm font-semibold text-lb-text mb-2 mt-1">Son anılar</h3>
              {recentListError && (
                <div
                  role="alert"
                  className="mb-2 rounded-xl border border-lb-danger/35 bg-lb-danger/10 px-3 py-2 text-xs text-lb-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <span>{recentListError}</span>
                  <button
                    type="button"
                    onClick={() => refreshRecentEntries()}
                    className="shrink-0 rounded-lg border border-lb-border bg-lb-elevated px-2.5 py-1 text-[11px] font-medium text-lb-accent"
                  >
                    Tekrar dene
                  </button>
                </div>
              )}
              {recentEntriesLoading ? (
                <p className="text-xs text-lb-subtext">Yükleniyor…</p>
              ) : latestEntries.length === 0 ? (
                <p className="text-xs text-lb-subtext">Henüz anı eklenmedi.</p>
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
                        className="w-full text-left rounded-xl border border-lb-border bg-lb-canvas hover:bg-lb-muted/50 px-3 py-2 transition active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : previewVideo ? (
                            <div className="w-10 h-10 rounded-lg shrink-0 bg-lb-muted text-lb-accent flex items-center justify-center text-[10px] font-semibold">
                              VIDEO
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-lb-subtext">
                              {entry.date} • {entry.userDisplayName}
                            </p>
                            <p className="text-xs text-lb-text truncate">
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

      {viewMode === 'feed' && (
        <MemoryFeedScreen
          allEntries={feedEntries}
          loading={allEntriesLoading}
          currentUserEmail={user?.email ?? ''}
          onOpenComments={(e) => setCommentEntry(e)}
          onToggleFavorite={(e) => void handleFeedFavorite(e)}
          onDeleteEntry={(id) => void handleFeedDelete(id)}
          onEditEntry={(e) => handleFeedEdit(e)}
        />
      )}

      {viewMode === 'profile' && <ProfileScreen stats={profileStats} />}

      {commentEntry && (
        <CommentsScreen
          entry={commentEntry}
          onClose={() => setCommentEntry(null)}
          onCommentsUpdated={(entryId) => void handleCommentCountRefresh(entryId)}
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
