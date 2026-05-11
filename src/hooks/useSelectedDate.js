import { useCallback, useState } from 'react';

export function useSelectedDate() {
  const [selectedDate, setSelectedDate] = useState(null);

  const selectDate = useCallback((dateKey) => {
    setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
  }, []);

  const clearDate = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return { selectedDate, selectDate, clearDate };
}
