import { useState, useCallback, useEffect } from 'react';

export function usePrizes(childId: string) {
  const storageKey = `space-reader-prizes-${childId}`;
  const [prizes, setPrizes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem(storageKey);
      if (data) setPrizes(JSON.parse(data));
      else setPrizes([]);
    } catch { setPrizes([]); }
  }, [storageKey]);

  const addPrize = useCallback((emoji: string) => {
    setPrizes(prev => {
      if (prev.includes(emoji)) return prev;
      const next = [...prev, emoji];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const clearPrizes = useCallback(() => {
    setPrizes([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { prizes, addPrize, clearPrizes };
}
