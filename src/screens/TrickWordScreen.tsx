import { useState, useCallback, useMemo } from 'react';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import { getTrickWordsForUnit, getPhoneticHFWForUnit, getTrueTrickWordsForUnit } from '../data/trickWords';
import { getUnitById } from '../data/curriculum';
import { speakWord } from '../audio/speechUtils';
import { playGotItSound } from '../audio/soundEffects';
import StreakCelebration from '../components/StreakCelebration';
import { useStreak } from '../hooks/useStreak';
import type { Rating, TrickWord } from '../types';
import type { Recorder } from '../hooks/useRecorder';

interface TrickWordScreenProps {
  unitId: string;
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  mode?: 'all' | 'phonetic' | 'trick';
  recorder?: Recorder;
}

const CHUNK_SIZE = 3;

export default function TrickWordScreen({ unitId, onBack, onRate, mode = 'all', recorder }: TrickWordScreenProps) {
  const unit = getUnitById(unitId);
  const words = mode === 'phonetic'
    ? getPhoneticHFWForUnit(unitId)
    : mode === 'trick'
      ? getTrueTrickWordsForUnit(unitId)
      : getTrickWordsForUnit(unitId);

  // Chunk words into groups of 3
  const chunks = useMemo(() => {
    const result: TrickWord[][] = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      result.push(words.slice(i, i + CHUNK_SIZE));
    }
    return result;
  }, [words]);

  const [chunkIndex, setChunkIndex] = useState(0);
  const [phase, setPhase] = useState<'i_do' | 'you_do'>('i_do');
  const [wordIndex, setWordIndex] = useState(0); // index within current chunk
  const [revealed, setRevealed] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  const currentChunk = chunks[chunkIndex] || [];
  const currentWord = currentChunk[wordIndex];

  const playWord = useCallback((word: TrickWord) => {
    if (recorder) {
      const played = recorder.playWordRecording(word.word.toLowerCase());
      if (!played) speakWord(word.word);
    } else {
      speakWord(word.word);
    }
  }, [recorder]);

  // === I DO: Tap to reveal → auto-play → tap next ===
  const handleIDo = () => {
    if (!currentWord) return;
    if (!revealed) {
      setRevealed(true);
      setTimeout(() => playWord(currentWord), 300);
    } else {
      // Move to next word in chunk or transition to You Do
      if (wordIndex < currentChunk.length - 1) {
        setWordIndex(prev => prev + 1);
        setRevealed(false);
      } else {
        // Done with I Do for this chunk → switch to You Do
        setPhase('you_do');
        setWordIndex(0);
        setRevealed(true); // words are visible in You Do
        setShowRating(true);
      }
    }
  };

  // === YOU DO: Child reads, tap card to hear if stuck ===
  const handleYouDo = () => {
    if (!currentWord) return;
    playWord(currentWord);
  };

  const handleRate = useCallback((rating: Rating) => {
    if (!currentWord) return;
    onRate(unitId, `trick-${currentWord.word}`, rating);
    recordRating(rating);
    if (rating === 'green') playGotItSound();
    setShowRating(false);
    setCelebrationRating(rating);
  }, [unitId, currentWord, onRate, recordRating]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationRating(null);

    if (wordIndex < currentChunk.length - 1) {
      // Next word in You Do
      setWordIndex(prev => prev + 1);
      setShowRating(true);
    } else if (chunkIndex < chunks.length - 1) {
      // Move to next chunk → back to I Do
      setChunkIndex(prev => prev + 1);
      setPhase('i_do');
      setWordIndex(0);
      setRevealed(false);
      setShowRating(false);
    }
    // else: last chunk done — stay, Done button is visible
  }, [wordIndex, currentChunk.length, chunkIndex, chunks.length]);

  const isLastWord = chunkIndex === chunks.length - 1 && wordIndex === currentChunk.length - 1;
  const isDone = phase === 'you_do' && isLastWord && celebrationRating === null && !showRating;

  if (!unit || words.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
        <p>No trick words for this unit.</p>
        <button onClick={onBack} style={backBtnStyle}>Back</button>
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
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            color: '#FFD700', fontFamily: "'Nunito', sans-serif",
            fontSize: 24, margin: 0,
          }}>
            {mode === 'phonetic' ? '📖 Word Reading' : '✨ Trick Words'}
          </h2>
          <p style={{ color: '#B0BEC5', fontSize: 13, margin: '4px 0 0' }}>
            {unit.name}
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

      {currentWord && (
        <>
          {/* Instruction */}
          <p style={{
            color: '#B0BEC5', fontSize: 14,
            fontFamily: "'Nunito', sans-serif",
            marginBottom: 16, textAlign: 'center',
          }}>
            {phase === 'i_do'
              ? (revealed ? 'Tap to continue →' : 'Tap to see the word!')
              : 'Can you read this word?'
            }
          </p>

          {/* Flash card */}
          <button
            onClick={phase === 'i_do' ? handleIDo : handleYouDo}
            style={{
              width: 280, height: 200, borderRadius: 24,
              border: `3px solid ${phase === 'i_do' ? '#4FC3F7' : '#CE93D8'}`,
              background: phase === 'i_do'
                ? (revealed
                  ? 'linear-gradient(135deg, rgba(79,195,247,0.2), rgba(79,195,247,0.1))'
                  : 'linear-gradient(135deg, rgba(79,195,247,0.1), rgba(79,195,247,0.05))')
                : 'linear-gradient(135deg, rgba(206,147,216,0.2), rgba(79,195,247,0.2))',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, marginBottom: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {phase === 'i_do' && !revealed ? (
              <>
                <span style={{ fontSize: 48 }}>✨</span>
                <span style={{
                  color: '#B0BEC5', fontSize: 18,
                  fontFamily: "'Nunito', sans-serif",
                }}>
                  Tap to reveal!
                </span>
              </>
            ) : (
              <span style={{
                fontSize: 56, fontWeight: 'bold', color: '#fff',
                fontFamily: "'Nunito', sans-serif",
              }}>
                {currentWord.word}
              </span>
            )}
          </button>

          {/* You Do hints */}
          {phase === 'you_do' && (
            <p style={{
              color: 'rgba(255,255,255,0.3)', fontSize: 12,
              fontFamily: "'Nunito', sans-serif", fontStyle: 'italic',
              margin: '0 0 12px',
            }}>
              tap the word to hear it
            </p>
          )}

          {/* Parent rating — only in You Do */}
          {phase === 'you_do' && showRating && (
            <ParentRating onRate={handleRate} />
          )}

          {/* Done button */}
          {isDone && (
            <button onClick={onBack} style={{
              ...navBtnStyle,
              background: 'rgba(76, 175, 80, 0.3)',
              borderColor: '#4CAF50', marginTop: 20,
            }}>
              Done! 🎉
            </button>
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

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12, color: '#fff',
  padding: '8px 16px', cursor: 'pointer',
  fontSize: 14, fontFamily: "'Nunito', sans-serif",
};

const navBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12, color: '#fff',
  padding: '10px 24px', cursor: 'pointer',
  fontSize: 16, fontFamily: "'Nunito', sans-serif",
};
