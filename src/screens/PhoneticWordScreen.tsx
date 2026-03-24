import { useState, useCallback, useEffect, useContext } from 'react';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import ProfileContext from '../components/ProfileContext';
import WordWithDots from '../components/WordWithDots';
import { getPhoneticHFWForUnit } from '../data/trickWords';
import { getUnitById } from '../data/curriculum';
import { playGotItSound, playNotQuiteSound } from '../audio/soundEffects';
import StreakCelebration from '../components/StreakCelebration';
import { useStreak } from '../hooks/useStreak';
import { useSessionResume } from '../hooks/useSessionResume';
import type { Recorder } from '../hooks/useRecorder';
import type { Rating } from '../types';

interface PhoneticWordScreenProps {
  unitId: string;
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
}

// Break a word into its individual sounds for tapping
// Simple approach: each character is a sound (works for CVC words without digraphs)
function wordToSounds(word: string): string[] {
  const sounds: string[] = [];
  let i = 0;
  while (i < word.length) {
    // Check for digraphs/glued sounds (2-3 char)
    if (i + 2 < word.length) {
      const three = word.slice(i, i + 3);
      if (['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'all'].includes(three)) {
        sounds.push(three);
        i += 3;
        continue;
      }
    }
    if (i + 1 < word.length) {
      const two = word.slice(i, i + 2);
      if (['sh', 'ch', 'th', 'wh', 'ck', 'ff', 'll', 'ss', 'zz', 'qu', 'am', 'an'].includes(two)) {
        sounds.push(two);
        i += 2;
        continue;
      }
    }
    sounds.push(word[i]);
    i++;
  }
  return sounds;
}

export default function PhoneticWordScreen({ unitId, onBack, onRate, recorder }: PhoneticWordScreenProps) {
  const profile = useContext(ProfileContext);
  const childId = profile?.childId || 'default';
  const unit = getUnitById(unitId);
  const words = getPhoneticHFWForUnit(unitId);

  const { getSavedSession, saveProgress, markCompletedOnce } = useSessionResume(childId, unitId, 'phonetic_hfw');
  const savedSession = getSavedSession();

  const [currentIndex, setCurrentIndex] = useState(savedSession?.currentIndex || 0);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  // Save progress
  useEffect(() => {
    saveProgress({ currentIndex });
  }, [currentIndex, saveProgress]);

  const currentWord = words[currentIndex];
  const sounds = currentWord ? wordToSounds(currentWord.word) : [];

  const handleRate = useCallback((rating: Rating) => {
    if (!currentWord) return;
    onRate(unitId, `hfw-${currentWord.word}`, rating);
    recordRating(rating);
    if (rating === 'green') {
      playGotItSound();
    } else {
      playNotQuiteSound();
    }
    setCelebrationRating(rating);
  }, [unitId, currentWord, onRate]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationRating(null);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, words.length]);

  const goToCard = (idx: number) => {
    setCurrentIndex(idx);
  };

  if (!unit || words.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
        <p>No regular words for this unit yet.</p>
        <button onClick={onBack} style={btnStyle}>Back</button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 600,
        marginBottom: 20,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            color: '#FFD700',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 24,
            margin: 0,
          }}>
            📖 Regular Words
          </h2>
          <p style={{ color: '#B0BEC5', fontSize: 13, margin: '4px 0 0' }}>
            {unit.name} — Sound it out!
          </p>
        </div>
        <span style={{ color: '#B0BEC5', fontSize: 14 }}>
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {words.map((_, i) => (
          <div
            key={i}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i < currentIndex ? '#4CAF50'
                : i === currentIndex ? '#FFD700'
                : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {currentWord && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <p style={{
            color: '#B0BEC5',
            fontSize: 18,
            fontFamily: "'Nunito', sans-serif",
          }}>
            Can you read this word?
          </p>

          {/* Word card with dots and tappable letters */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '32px 40px 24px',
            border: '2px solid rgba(255,255,255,0.12)',
            minWidth: 200,
          }}>
            <WordWithDots sounds={sounds} recorder={recorder} dotColor="#4FC3F7" />
          </div>

          {/* Hint */}
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13,
            fontFamily: "'Nunito', sans-serif",
            fontStyle: 'italic',
          }}>
            tap each letter to hear its sound
          </p>

          {/* Rating */}
          <ParentRating onRate={handleRate} />

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button
              onClick={() => goToCard(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              style={{ ...btnStyle, opacity: currentIndex === 0 ? 0.3 : 1 }}
            >
              ← Prev
            </button>

            {currentIndex === words.length - 1 ? (
              <button onClick={() => { markCompletedOnce(); onBack(); }} style={{
                ...btnStyle,
                background: 'rgba(76, 175, 80, 0.3)',
                borderColor: '#4CAF50',
              }}>
                Done! 🎉
              </button>
            ) : (
              <button onClick={() => goToCard(currentIndex + 1)} style={btnStyle}>
                Skip →
              </button>
            )}
          </div>
        </div>
      )}

      <SpaceCelebration
        rating={celebrationRating}
        onComplete={handleCelebrationComplete}
      />
      {showStreakCelebration && (
        <StreakCelebration streak={streak} onComplete={dismissStreakCelebration} />
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12,
  color: '#fff',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: "'Nunito', sans-serif",
};
