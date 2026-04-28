import { useState } from 'react';

export function useSelectedDate() {
  const [selectedDate, setSelectedDate] = useState(null);

  function selectDate(dateKey) {
    setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
  }

  function clearDate() {
    setSelectedDate(null);
  }

  return { selectedDate, selectDate, clearDate };
}
