import { useState, useCallback, useMemo } from 'react';
import SoundCard from '../components/SoundCard';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import { getSoundCardsForUnit, getSoundCardsUpToUnit } from '../data/soundCards';
import { getUnitById } from '../data/curriculum';
import { playGotItSound, playNotQuiteSound } from '../audio/soundEffects';
import StreakCelebration from '../components/StreakCelebration';
import { useStreak } from '../hooks/useStreak';
import type { Recorder } from '../hooks/useRecorder';
import type { Rating, SoundCard as SoundCardType } from '../types';

interface SoundDrillScreenProps {
  unitId: string;
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
}

const CHUNK_SIZE = 3;

export default function SoundDrillScreen({ unitId, onBack, onRate, recorder }: SoundDrillScreenProps) {
  const unit = getUnitById(unitId);
  const isReview = unitId.startsWith('L1');
  const cards = isReview ? getSoundCardsUpToUnit(unitId) : getSoundCardsForUnit(unitId);

  const chunks = useMemo(() => {
    const result: SoundCardType[][] = [];
    for (let i = 0; i < cards.length; i += CHUNK_SIZE) {
      result.push(cards.slice(i, i + CHUNK_SIZE));
    }
    return result;
  }, [cards]);

  const [chunkIndex, setChunkIndex] = useState(0);
  const [phase, setPhase] = useState<'i_do' | 'you_do'>('i_do');
  const [wordIndex, setWordIndex] = useState(0);
  const [iDoRevealed, setIDoRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  const currentChunk = chunks[chunkIndex] || [];
  const currentCard = currentChunk[wordIndex];

  const playSound = useCallback((card: SoundCardType) => {
    if (recorder.hasRecording(card.id)) {
      recorder.playRecording(card.id);
    }
  }, [recorder]);

  // === I DO: Show visual card + auto-play sound ===
  const handleIDo = () => {
    if (!currentCard) return;
    if (!iDoRevealed) {
      // First tap: reveal the card (show back with visual + keyword)
      setIDoRevealed(true);
      setTimeout(() => playSound(currentCard), 300);
    } else {
      // Second tap: advance to next card in chunk or move to You Do
      if (wordIndex < currentChunk.length - 1) {
        setWordIndex(prev => prev + 1);
        setIDoRevealed(false);
      } else {
        setPhase('you_do');
        setWordIndex(0);
        setFlipped(false);
      }
    }
  };

  // === YOU DO: Show front (letter only), flip for hint, tap again for sound ===
  const handleYouDoTap = () => {
    if (!currentCard) return;
    if (!flipped) {
      setFlipped(true);
    } else {
      playSound(currentCard);
    }
  };

  const handleRate = useCallback((rating: Rating) => {
    if (!currentCard) return;
    onRate(unitId, currentCard.id, rating);
    recordRating(rating);
    if (rating === 'green') playGotItSound();
    else playNotQuiteSound();
    setCelebrationRating(rating);
  }, [unitId, currentCard, onRate, recordRating]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationRating(null);

    if (wordIndex < currentChunk.length - 1) {
      setWordIndex(prev => prev + 1);
      setFlipped(false);
    } else if (chunkIndex < chunks.length - 1) {
      setChunkIndex(prev => prev + 1);
      setPhase('i_do');
      setWordIndex(0);
      setIDoRevealed(false);
      setFlipped(false);
    }
    // else: last chunk done — Done button visible
  }, [wordIndex, currentChunk.length, chunkIndex, chunks.length]);

  const isLastCard = chunkIndex === chunks.length - 1 && wordIndex === currentChunk.length - 1;
  const isDone = phase === 'you_do' && isLastCard && celebrationRating === null;

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
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 600, marginBottom: 16,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            color: '#FFD700', fontFamily: "'Nunito', sans-serif",
            fontSize: 24, margin: 0,
          }}>
            🔊 Sound Drill
          </h2>
          <p style={{ color: '#B0BEC5', fontSize: 13, margin: '4px 0 0' }}>
            {unit.name} — {unit.description}
          </p>
        </div>
        <span style={{ color: '#B0BEC5', fontSize: 14 }}>
          Group {chunkIndex + 1}/{chunks.length}
        </span>
      </div>

      {/* Phase label */}
      <div style={{
        background: phase === 'i_do'
          ? 'rgba(79, 195, 247, 0.15)'
          : 'rgba(76, 175, 80, 0.15)',
        border: `2px solid ${phase === 'i_do' ? 'rgba(79, 195, 247, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`,
        borderRadius: 12, padding: '8px 20px', marginBottom: 16,
      }}>
        <span style={{
          color: phase === 'i_do' ? '#4FC3F7' : '#4CAF50',
          fontSize: 16, fontWeight: 'bold',
          fontFamily: "'Nunito', sans-serif",
        }}>
          {phase === 'i_do' ? '👀 Watch & Listen' : '🌟 Your Turn!'}
        </span>
      </div>

      {/* Word group dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {currentChunk.map((_, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: i < wordIndex ? '#4CAF50'
              : i === wordIndex ? (phase === 'i_do' ? '#4FC3F7' : '#FFD700')
              : 'rgba(255,255,255,0.15)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {currentCard && (
        <>
          {/* === I DO PHASE === */}
          {phase === 'i_do' && (
            <>
              <p style={{
                color: '#B0BEC5', fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                marginBottom: 16, textAlign: 'center',
              }}>
                {iDoRevealed ? 'Tap to continue →' : 'Tap to see and hear this sound!'}
              </p>

              <div onClick={handleIDo} style={{ cursor: 'pointer' }}>
                <SoundCard
                  card={currentCard}
                  size="large"
                  showFront={!iDoRevealed}
                  onTap={handleIDo}
                />
              </div>
            </>
          )}

          {/* === YOU DO PHASE === */}
          {phase === 'you_do' && (
            <>
              <p style={{
                color: '#B0BEC5', fontSize: 18,
                fontFamily: "'Nunito', sans-serif",
                marginBottom: 8,
              }}>
                {currentCard.grapheme.replace(/[A-Z-]/g, '').length > 1
                  ? 'What sound do these letters make?'
                  : 'What sound does this letter make?'}
              </p>

              <SoundCard
                card={currentCard}
                size="large"
                showFront={!flipped}
                onTap={handleYouDoTap}
              />

              <p style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 13,
                fontFamily: "'Nunito', sans-serif", fontStyle: 'italic',
                marginTop: 8,
              }}>
                {!flipped
                  ? 'unsure? tap card to flip'
                  : 'still unsure? tap card to hear sound'}
              </p>

              <div style={{ marginTop: 8 }}>
                <ParentRating onRate={handleRate} />
              </div>

              {/* Done button */}
              {isDone && (
                <button onClick={onBack} style={{
                  ...btnStyle,
                  background: 'rgba(76, 175, 80, 0.3)',
                  borderColor: '#4CAF50', marginTop: 20,
                }}>
                  Done! 🎉
                </button>
              )}
            </>
          )}
        </>
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
  borderRadius: 12, color: '#fff',
  padding: '8px 16px', cursor: 'pointer',
  fontSize: 14, fontFamily: "'Nunito', sans-serif",
};
