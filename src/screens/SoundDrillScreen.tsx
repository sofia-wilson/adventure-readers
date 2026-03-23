import { useState, useCallback } from 'react';
import SoundCard from '../components/SoundCard';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import { getSoundCardsForUnit, getSoundCardsUpToUnit } from '../data/soundCards';
import { getUnitById } from '../data/curriculum';
import { playGotItSound, playNotQuiteSound } from '../audio/soundEffects';
import StreakCelebration from '../components/StreakCelebration';
import { useStreak } from '../hooks/useStreak';
import type { Recorder } from '../hooks/useRecorder';
import type { Rating } from '../types';

interface SoundDrillScreenProps {
  unitId: string;
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
}

export default function SoundDrillScreen({ unitId, onBack, onRate, recorder }: SoundDrillScreenProps) {
  const unit = getUnitById(unitId);
  const isReview = unitId.startsWith('L1');
  const cards = isReview ? getSoundCardsUpToUnit(unitId) : getSoundCardsForUnit(unitId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  const currentCard = cards[currentIndex];

  const advance = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const handleRate = useCallback((rating: Rating) => {
    if (!currentCard) return;
    onRate(unitId, currentCard.id, rating);
    recordRating(rating);
    if (rating === 'green') {
      playGotItSound();
    } else {
      playNotQuiteSound();
    }
    setCelebrationRating(rating);
  }, [unitId, currentCard, onRate]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationRating(null);
    advance();
  }, [advance]);

  const handleFlip = () => {
    setFlipped(true);
  };

  const handlePlaySound = () => {
    if (currentCard && recorder.hasRecording(currentCard.id)) {
      recorder.playRecording(currentCard.id);
    }
  };

  const goToCard = (idx: number) => {
    setCurrentIndex(idx);
    setFlipped(false);
  };

  if (!unit || cards.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
        <p>No sound cards for this unit yet.</p>
        <button onClick={onBack} style={btnStyle}>Back to Map</button>
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
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: 24,
            margin: 0,
          }}>
            🔊 Sound Drill
          </h2>
          <p style={{ color: '#B0BEC5', fontSize: 13, margin: '4px 0 0' }}>
            {unit.name} — {unit.description}
          </p>
        </div>
        <span style={{ color: '#B0BEC5', fontSize: 14 }}>
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 400,
      }}>
        {cards.map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i < currentIndex ? '#4CAF50'
                : i === currentIndex ? '#FFD700'
                : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Current card */}
      {currentCard && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Prompt */}
          <p style={{
            color: '#B0BEC5',
            fontSize: 18,
            fontFamily: "'Comic Sans MS', cursive",
          }}>
            {currentCard.grapheme.replace(/[A-Z-]/g, '').length > 1
              ? 'What sound do these letters make?'
              : 'What sound does this letter make?'}
          </p>

          {/* Card — tap to flip (hint 2), tap again to hear sound (hint 3) */}
          <SoundCard
            card={currentCard}
            size="large"
            showFront={!flipped}
            onTap={!flipped ? handleFlip : handlePlaySound}
          />

          {/* Below-card hint text */}
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13,
            fontFamily: "'Comic Sans MS', cursive",
            fontStyle: 'italic',
          }}>
            {!flipped
              ? 'unsure? tap card to flip'
              : 'still unsure? tap card to hear sound'}
          </p>

          {/* Rating — always visible, both advance to next card */}
          <div style={{ marginTop: 8 }}>
            <ParentRating onRate={handleRate} />
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button
              onClick={() => goToCard(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              style={{
                ...btnStyle,
                opacity: currentIndex === 0 ? 0.3 : 1,
              }}
            >
              ← Prev
            </button>

            {currentIndex === cards.length - 1 ? (
              <button onClick={onBack} style={{
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
  fontFamily: "'Comic Sans MS', cursive",
};
