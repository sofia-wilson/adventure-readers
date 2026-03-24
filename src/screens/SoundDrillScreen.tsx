import { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import SoundCard from '../components/SoundCard';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import ProfileContext from '../components/ProfileContext';
import { getSoundCardsForUnit, getSoundCardsUpToUnit } from '../data/soundCards';
import { getUnitById } from '../data/curriculum';
import { playGotItSound, playNotQuiteSound } from '../audio/soundEffects';
import StreakCelebration from '../components/StreakCelebration';
import { useStreak } from '../hooks/useStreak';
import { useSessionResume } from '../hooks/useSessionResume';
import type { Recorder } from '../hooks/useRecorder';
import type { Rating, SoundCard as SoundCardType, AttemptRecord } from '../types';

interface SoundDrillScreenProps {
  unitId: string;
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
  attempts?: AttemptRecord[];
}

const CHUNK_SIZE = 3;

export default function SoundDrillScreen({ unitId, onBack, onRate, recorder }: SoundDrillScreenProps) {
  const profile = useContext(ProfileContext);
  const childId = profile?.childId || 'default';
  const unit = getUnitById(unitId);
  const isReview = unitId.startsWith('L1');
  const allCards = isReview ? getSoundCardsUpToUnit(unitId) : getSoundCardsForUnit(unitId);

  const { getSavedSession, saveProgress } = useSessionResume(childId, unitId, 'sound_drill');
  const savedSession = getSavedSession();

  // Adaptive filtering: use attempts to determine which sounds need practice
  // Read directly from localStorage to avoid stale closure issues
  const [{ cards, isAdaptive, allMastered: initialAllMastered }] = useState(() => {
    // Read attempts fresh from localStorage
    const storedAttempts: Array<{ unitId: string; activityType: string; itemId: string; rating: string }> = (() => {
      try {
        const data = localStorage.getItem(`space-reader-progress-${childId}`);
        return data ? JSON.parse(data) : [];
      } catch { return []; }
    })();

    const unitAttempts = storedAttempts.filter(
      (a: { unitId: string; activityType: string }) => a.unitId === unitId && a.activityType === 'sound_drill'
    );

    // Check: has every sound been attempted at least once?
    const allAttempted = allCards.every(card =>
      unitAttempts.some((a: { itemId: string }) => a.itemId === card.id)
    );

    if (!allAttempted) {
      return { cards: allCards, isAdaptive: false, allMastered: false };
    }

    // Find unmastered: latest attempt for each sound was NOT green
    const unmastered = allCards.filter(card => {
      const cardAttempts = unitAttempts.filter((a: { itemId: string }) => a.itemId === card.id);
      if (cardAttempts.length === 0) return true;
      const latest = cardAttempts[cardAttempts.length - 1];
      return latest.rating !== 'green';
    });

    if (unmastered.length === 0) {
      // All mastered!
      return { cards: allCards, isAdaptive: false, allMastered: true };
    }

    return { cards: unmastered, isAdaptive: true, allMastered: false };
  });

  const [showMastered, setShowMastered] = useState(initialAllMastered);

  const chunks = useMemo(() => {
    const result: SoundCardType[][] = [];
    for (let i = 0; i < cards.length; i += CHUNK_SIZE) {
      result.push(cards.slice(i, i + CHUNK_SIZE));
    }
    return result;
  }, [cards]);

  // In adaptive mode, always start fresh. Otherwise, restore saved position.
  const initialChunk = isAdaptive ? 0 : savedSession ? Math.min(savedSession.chunkIndex || 0, Math.max(0, chunks.length - 1)) : 0;
  const initialPhase = isAdaptive ? 'i_do' as const : savedSession ? (savedSession.phase as 'i_do' | 'you_do' || 'i_do') : 'i_do';
  const initialWordIndex = isAdaptive ? 0 : savedSession ? Math.min(savedSession.wordIndex || 0, Math.max(0, (chunks[initialChunk]?.length || 1) - 1)) : 0;

  const [chunkIndex, setChunkIndex] = useState(initialChunk);
  const [phase, setPhase] = useState<'i_do' | 'you_do'>(initialPhase);
  const [wordIndex, setWordIndex] = useState(initialWordIndex);
  const [iDoRevealed, setIDoRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  // Save progress synchronously whenever position changes
  useEffect(() => {
    saveProgress({ currentIndex: chunkIndex * CHUNK_SIZE + wordIndex, chunkIndex, wordIndex, phase });
  }, [chunkIndex, wordIndex, phase, saveProgress]);

  const currentChunk = chunks[chunkIndex] || [];
  const currentCard = currentChunk[wordIndex];

  const playSound = useCallback((card: SoundCardType) => {
    if (recorder.hasRecording(card.id)) {
      recorder.playRecording(card.id);
    }
  }, [recorder]);

  // === I DO: Tap to reveal, auto-play sound, then auto-advance ===
  const handleIDo = () => {
    if (!currentCard || iDoRevealed) return;
    setIDoRevealed(true);
    setTimeout(() => playSound(currentCard), 300);
    // Auto-advance after the sound plays
    setTimeout(() => {
      if (wordIndex < currentChunk.length - 1) {
        const nextWord = wordIndex + 1;
        setWordIndex(nextWord);
        setIDoRevealed(false);
        saveProgress({ currentIndex: chunkIndex * CHUNK_SIZE + nextWord, chunkIndex, wordIndex: nextWord, phase: 'i_do' });
      } else {
        setPhase('you_do');
        setWordIndex(0);
        setFlipped(false);
        saveProgress({ currentIndex: chunkIndex * CHUNK_SIZE, chunkIndex, wordIndex: 0, phase: 'you_do' });
      }
    }, 2000);
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
      const nextWord = wordIndex + 1;
      setWordIndex(nextWord);
      setFlipped(false);
      saveProgress({ currentIndex: chunkIndex * CHUNK_SIZE + nextWord, chunkIndex, wordIndex: nextWord, phase });
    } else if (chunkIndex < chunks.length - 1) {
      const nextChunk = chunkIndex + 1;
      setChunkIndex(nextChunk);
      setPhase('i_do');
      setWordIndex(0);
      setIDoRevealed(false);
      setFlipped(false);
      saveProgress({ currentIndex: nextChunk * CHUNK_SIZE, chunkIndex: nextChunk, wordIndex: 0, phase: 'i_do' });
    }
    // else: last chunk done — Done button visible
  }, [wordIndex, currentChunk.length, chunkIndex, chunks.length, phase, saveProgress]);

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

  // All sounds mastered — show celebration with option to review
  if (showMastered) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: 20, gap: 20,
      }}>
        <span style={{ fontSize: 80 }}>🌟</span>
        <h2 style={{
          color: '#FFD700', fontFamily: "'Nunito', sans-serif",
          fontSize: 28, textAlign: 'center', margin: 0,
        }}>
          All Sounds Mastered!
        </h2>
        <p style={{
          color: '#B0BEC5', fontSize: 16, textAlign: 'center',
          fontFamily: "'Nunito', sans-serif", maxWidth: 300,
        }}>
          {allCards.length}/{allCards.length} sounds — amazing work!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => setShowMastered(false)}
            style={{
              background: 'rgba(79, 195, 247, 0.15)',
              border: '2px solid rgba(79, 195, 247, 0.4)',
              borderRadius: 14, color: '#4FC3F7', padding: '14px 32px',
              cursor: 'pointer', fontSize: 16, fontWeight: 'bold',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            🔄 Review All Sounds
          </button>
          <button onClick={onBack} style={{
            ...btnStyle, fontSize: 16, padding: '14px 32px',
          }}>
            ← Back
          </button>
        </div>
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

      {/* Adaptive mode banner */}
      {isAdaptive && (
        <div style={{
          background: 'rgba(255, 152, 0, 0.15)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: 10, padding: '6px 16px', marginBottom: 12,
        }}>
          <p style={{
            color: '#FFB74D', fontSize: 13, margin: 0,
            fontFamily: "'Nunito', sans-serif", textAlign: 'center',
          }}>
            ✨ Practicing {cards.length} sound{cards.length !== 1 ? 's' : ''} that need more work
          </p>
        </div>
      )}

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
                Tap to see and hear this sound!
              </p>

              <SoundCard
                card={currentCard}
                size="large"
                showFront={!iDoRevealed}
                onTap={handleIDo}
              />

              {/* Navigation */}
              <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
                <button
                  onClick={() => {
                    if (wordIndex > 0) {
                      setWordIndex(prev => prev - 1);
                      setIDoRevealed(false);
                    } else if (chunkIndex > 0) {
                      setChunkIndex(prev => prev - 1);
                      setWordIndex(0);
                      setPhase('i_do');
                      setIDoRevealed(false);
                    }
                  }}
                  disabled={chunkIndex === 0 && wordIndex === 0}
                  style={{ ...btnStyle, opacity: (chunkIndex === 0 && wordIndex === 0) ? 0.3 : 1 }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => {
                    if (wordIndex < currentChunk.length - 1) {
                      setWordIndex(prev => prev + 1);
                      setIDoRevealed(false);
                    } else {
                      setPhase('you_do');
                      setWordIndex(0);
                      setFlipped(false);
                    }
                  }}
                  style={btnStyle}
                >
                  Skip →
                </button>
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

              {/* Parent instruction tip — only on first sound */}
              {chunkIndex === 0 && wordIndex === 0 && (
                <div style={{
                  background: 'rgba(255, 215, 0, 0.08)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: 10, padding: '8px 14px', marginTop: 16,
                  maxWidth: 340,
                }}>
                  <p style={{
                    color: 'rgba(255, 215, 0, 0.7)', fontSize: 12, margin: 0,
                    fontFamily: "'Nunito', sans-serif", fontStyle: 'italic',
                    textAlign: 'center',
                  }}>
                    💡 Tip: Encourage your child to say the sound just by seeing the letter(s). If they're unsure, they can flip for a visual hint or tap again to hear the sound.
                  </p>
                </div>
              )}

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
