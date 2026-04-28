import { useState, useRef } from 'react';
import { START_YEAR } from './config/appConfig';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useYearEntries, useDayEntries } from './hooks/useEntries';
import ProtectedRoute from './components/ProtectedRoute';
import BookLayout from './components/BookLayout';
import YearNavigation from './components/YearNavigation';
import YearPage from './components/YearPage';
import DayDetailPanel from './components/DayDetailPanel';

const ANIM_CLASS = {
  'exit-forward':  'page-exit-forward',
  'exit-back':     'page-exit-back',
  'enter-forward': 'page-enter-forward',
  'enter-back':    'page-enter-back',
};

function AppContent() {
  const [year, setYear]       = useState(START_YEAR);
  const [pageAnim, setPageAnim] = useState(null); // null | 'exit-forward' | 'exit-back' | 'enter-forward' | 'enter-back'
  const pendingYear = useRef(null);

  const { selectedDate, selectDate, clearDate } = useSelectedDate();
  const { datesWithContent, refresh: refreshYear } = useYearEntries(year);
  const { entries: dayEntries, loading: dayLoading, refresh: refreshDay } = useDayEntries(selectedDate);

  const isAnimating = pageAnim !== null;

  function goNext() {
    if (isAnimating) return;
    pendingYear.current = year + 1;
    setPageAnim('exit-forward');
  }

  function goPrev() {
    if (isAnimating || year <= START_YEAR) return;
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

      {/* Animated page wrapper */}
      <div
        className={ANIM_CLASS[pageAnim] ?? ''}
        onAnimationEnd={handleAnimEnd}
        style={{ willChange: 'transform, opacity' }}
      >
        <YearPage
          year={year}
          datesWithContent={datesWithContent}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
        />
      </div>

      {selectedDate && (
        <DayDetailPanel
          dateKey={selectedDate}
          entries={dayEntries}
          loading={dayLoading}
          onClose={clearDate}
          onRefresh={handleRefresh}
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
