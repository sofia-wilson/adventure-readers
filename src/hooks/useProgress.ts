import { useState, useCallback, useEffect } from 'react';
import type { AttemptRecord, Rating, UnitProgress } from '../types';
import { units } from '../data/curriculum';

function loadAttempts(childId: string): AttemptRecord[] {
  try {
    const data = localStorage.getItem(`space-reader-progress-${childId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAttempts(childId: string, attempts: AttemptRecord[]): void {
  localStorage.setItem(`space-reader-progress-${childId}`, JSON.stringify(attempts));
}

export function useProgress(childId: string) {
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadAttempts(childId));

  useEffect(() => {
    saveAttempts(childId, attempts);
  }, [childId, attempts]);

  const recordAttempt = useCallback((
    unitId: string,
    activityType: AttemptRecord['activityType'],
    itemId: string,
    rating: Rating
  ) => {
    setAttempts(prev => [...prev, {
      unitId,
      activityType,
      itemId,
      rating,
      timestamp: Date.now(),
    }]);
  }, []);

  const getUnitProgress = useCallback((unitId: string): UnitProgress => {
    const unitAttempts = attempts.filter(a => a.unitId === unitId);
    const greenCount = unitAttempts.filter(a => a.rating === 'green').length;
    const yellowCount = unitAttempts.filter(a => a.rating === 'yellow').length;
    const redCount = unitAttempts.filter(a => a.rating === 'red').length;
    const total = unitAttempts.length;

    // Mastery: green = 100%, yellow = 50%, red = 0%
    const mastery = total > 0
      ? Math.round(((greenCount * 100 + yellowCount * 50) / (total * 100)) * 100)
      : 0;

    // A unit is unlocked if the previous unit has >= 80% mastery (or it's the first unit)
    const unitIndex = units.findIndex(u => u.id === unitId);
    let unlocked = unitIndex === 0;
    if (unitIndex > 0) {
      const prevUnit = units[unitIndex - 1];
      const prevProgress = getUnitProgressRaw(prevUnit.id);
      unlocked = prevProgress.mastery >= 80 || prevProgress.totalAttempts === 0 && unitIndex <= 1;
    }

    return {
      unitId,
      totalAttempts: total,
      greenCount,
      yellowCount,
      redCount,
      mastery,
      unlocked: unlocked || unitIndex === 0,
      completed: mastery >= 80 && total >= 3,
    };
  }, [attempts]);

  // Internal version without unlock logic to avoid recursion
  const getUnitProgressRaw = (unitId: string): UnitProgress => {
    const unitAttempts = attempts.filter(a => a.unitId === unitId);
    const greenCount = unitAttempts.filter(a => a.rating === 'green').length;
    const yellowCount = unitAttempts.filter(a => a.rating === 'yellow').length;
    const redCount = unitAttempts.filter(a => a.rating === 'red').length;
    const total = unitAttempts.length;
    const mastery = total > 0
      ? Math.round(((greenCount * 100 + yellowCount * 50) / (total * 100)) * 100)
      : 0;
    return {
      unitId,
      totalAttempts: total,
      greenCount,
      yellowCount,
      redCount,
      mastery,
      unlocked: true,
      completed: mastery >= 80 && total >= 3,
    };
  };

  const isUnitUnlocked = useCallback((unitId: string): boolean => {
    const unitIndex = units.findIndex(u => u.id === unitId);
    if (unitIndex <= 0) return true;

    // Check all previous units have enough mastery
    for (let i = 0; i < unitIndex; i++) {
      const prev = getUnitProgressRaw(units[i].id);
      if (prev.totalAttempts > 0 && prev.mastery < 80) return false;
    }
    // Also need previous unit to have at least some attempts
    const prevAttempts = attempts.filter(a => a.unitId === units[unitIndex - 1].id);
    return prevAttempts.length >= 3;
  }, [attempts]);

  const getAllProgress = useCallback((): UnitProgress[] => {
    return units.map(u => ({
      ...getUnitProgressRaw(u.id),
      unlocked: isUnitUnlocked(u.id),
    }));
  }, [attempts, isUnitUnlocked]);

  const getAttemptsForUnit = useCallback((unitId: string): AttemptRecord[] => {
    return attempts.filter(a => a.unitId === unitId);
  }, [attempts]);

  const clearProgress = useCallback(() => {
    setAttempts([]);
    localStorage.removeItem(`space-reader-progress-${childId}`);
    // Also clear session resume data and concept intro flags for this child
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith(`session-${childId}-`) ||
        key.startsWith(`concept-intro-seen-${childId}-`)
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, [childId]);

  return {
    recordAttempt,
    getUnitProgress,
    isUnitUnlocked,
    getAllProgress,
    getAttemptsForUnit,
    clearProgress,
    totalAttempts: attempts.length,
    attempts,
  };
}
