import { useState, useCallback, useRef } from 'react';
import type { Rating } from '../types';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const streakRef = useRef(0);

  const recordRating = useCallback((rating: Rating) => {
    if (rating === 'green') {
      streakRef.current += 1;
      setStreak(streakRef.current);
      if (streakRef.current > 0 && streakRef.current % 3 === 0) {
        setShowStreakCelebration(true);
      }
    } else {
      streakRef.current = 0;
      setStreak(0);
    }
  }, []);

  const dismissStreakCelebration = useCallback(() => {
    setShowStreakCelebration(false);
  }, []);

  return {
    streak,
    showStreakCelebration,
    recordRating,
    dismissStreakCelebration,
  };
}
