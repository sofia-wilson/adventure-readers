import { useState, useCallback, useEffect } from 'react';

interface SessionState {
  currentIndex: number;
  phase?: string;
  chunkIndex?: number;
  wordIndex?: number;
  completedOnce?: boolean;
  timestamp: number;
}

function getKey(childId: string, unitId: string, activity: string): string {
  return `session-${childId}-${unitId}-${activity}`;
}

function loadSession(childId: string, unitId: string, activity: string): SessionState | null {
  try {
    const key = getKey(childId, unitId, activity);
    const data = localStorage.getItem(key);
    if (!data) return null;
    const session = JSON.parse(data) as SessionState;
    // Expire sessions older than 7 days
    if (Date.now() - session.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(childId: string, unitId: string, activity: string, state: SessionState): void {
  const key = getKey(childId, unitId, activity);
  localStorage.setItem(key, JSON.stringify(state));
}

export function useSessionResume(childId: string, unitId: string, activity: string) {
  const [initialized, setInitialized] = useState(false);

  const getSavedSession = useCallback((): SessionState | null => {
    return loadSession(childId, unitId, activity);
  }, [childId, unitId, activity]);

  const saveProgress = useCallback((state: Omit<SessionState, 'timestamp'>) => {
    saveSession(childId, unitId, activity, { ...state, timestamp: Date.now() });
  }, [childId, unitId, activity]);

  const markCompletedOnce = useCallback(() => {
    const existing = loadSession(childId, unitId, activity);
    saveSession(childId, unitId, activity, {
      currentIndex: 0,
      completedOnce: true,
      timestamp: Date.now(),
      ...(existing || {}),
    });
  }, [childId, unitId, activity]);

  const clearSession = useCallback(() => {
    const key = getKey(childId, unitId, activity);
    localStorage.removeItem(key);
  }, [childId, unitId, activity]);

  useEffect(() => {
    setInitialized(true);
  }, []);

  return {
    initialized,
    getSavedSession,
    saveProgress,
    markCompletedOnce,
    clearSession,
  };
}

/**
 * Given all items and attempt history, returns items filtered to un-mastered ones
 * if the child has completed the activity once. Otherwise returns all items.
 */
export function getAdaptiveItems<T extends { id?: string; word?: string }>(
  allItems: T[],
  attempts: Array<{ itemId: string; rating: string }>,
  completedOnce: boolean,
  idKey: 'id' | 'word' = 'id'
): T[] {
  if (!completedOnce) return allItems;

  // Find items that haven't been mastered (never got "green", or latest attempt was not "green")
  const unmastered = allItems.filter(item => {
    const itemId = idKey === 'id' ? (item as { id: string }).id : (item as { word: string }).word;
    const itemAttempts = attempts.filter(a => a.itemId === itemId);
    if (itemAttempts.length === 0) return true; // Never attempted
    // Check if the most recent attempt was green
    const latest = itemAttempts[itemAttempts.length - 1];
    return latest.rating !== 'green';
  });

  // If all mastered, return all items for review
  return unmastered.length > 0 ? unmastered : allItems;
}
