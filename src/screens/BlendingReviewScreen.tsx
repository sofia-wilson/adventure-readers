import { useState, useCallback, useMemo } from 'react';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import StreakCelebration from '../components/StreakCelebration';
import WordWithDots from '../components/WordWithDots';
import { getAllBlendingWords } from '../data/curriculum';
import { playGotItSound, playNotQuiteSound } from '../audio/soundEffects';
import { useStreak } from '../hooks/useStreak';
import type { Recorder } from '../hooks/useRecorder';
import type { Rating, BlendingWord } from '../types';

interface BlendingReviewScreenProps {
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TOTAL_ROUNDS = 3;

function buildRounds(allWords: BlendingWord[]): BlendingWord[][] {
  const shuffled = shuffle(allWords);
  const perRound = Math.ceil(shuffled.length / TOTAL_ROUNDS);
  const rounds: BlendingWord[][] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    rounds.push(shuffled.slice(i * perRound, (i + 1) * perRound));
  }
  return rounds;
}

export default function BlendingReviewScreen({ onBack, onRate, recorder }: BlendingReviewScreenProps) {
  const rounds = useMemo(() => buildRounds(getAllBlendingWords()), []);
  const [round, setRound] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  const words = rounds[round];
  const currentWord = words?.[currentIndex];

  const handleRate = useCallback((rating: Rating) => {
    if (!currentWord) return;
    onRate('K-U8', currentWord.word, rating);
    recordRating(rating);
    if (rating === 'green') playGotItSound();
    else playNotQuiteSound();
    setCelebrationRating(rating);
  }, [currentWord, onRate, recordRating]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationRating(null);
    if (showStreakCelebration) return;
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setRoundComplete(true);
    }
  }, [currentIndex, words.length, showStreakCelebration]);

  const startNextRound = () => {
    setRound(prev => prev + 1);
    setCurrentIndex(0);
    setRoundComplete(false);
  };


  if (!words || words.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
        <p>No review words yet.</p>
        <button onClick={onBack} style={btnStyle}>Back</button>
      </div>
    );
  }

  // Round complete celebration
  if (roundComplete) {
    const isLastRound = round >= TOTAL_ROUNDS - 1;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: 20, gap: 20,
      }}>
        <span style={{ fontSize: 80 }}>
          {isLastRound ? '🏆' : round === 0 ? '🌟' : '🚀'}
        </span>
        <h2 style={{
          color: '#FFD700', fontFamily: "'Nunito', sans-serif",
          fontSize: 32, textAlign: 'center',
        }}>
          {isLastRound
            ? 'All 3 Rounds Complete!'
            : `Round ${round + 1} Complete!`}
        </h2>
        <p style={{
          color: '#B0BEC5', fontSize: 18,
          fontFamily: "'Nunito', sans-serif", textAlign: 'center', maxWidth: 350,
        }}>
          {isLastRound
            ? 'Amazing job! You read all the words!'
            : `Great work! Ready for Round ${round + 2}?`}
        </p>

        {!isLastRound && (
          <button onClick={startNextRound} style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
            border: 'none', borderRadius: 16, color: '#1a1a2e',
            padding: '16px 40px', cursor: 'pointer', fontSize: 20,
            fontWeight: 'bold', fontFamily: "'Nunito', sans-serif",
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
          }}>
            🚀 Start Round {round + 2}!
          </button>
        )}

        <button onClick={onBack} style={{
          ...btnStyle, marginTop: isLastRound ? 0 : 12,
          ...(isLastRound ? { background: 'rgba(76,175,80,0.3)', borderColor: '#4CAF50', fontSize: 18, padding: '14px 32px' } : {}),
        }}>
          {isLastRound ? '🏠 Back to Map' : '← Back to Map'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', minHeight: '100vh',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 600, marginBottom: 12,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <h2 style={{ color: '#FFD700', fontFamily: "'Nunito', sans-serif", fontSize: 24, margin: 0 }}>
          🔄 Blending Review
        </h2>
        <span style={{ color: '#B0BEC5', fontSize: 14 }}>{currentIndex + 1} / {words.length}</span>
      </div>

      {/* Round indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 10, fontSize: 12,
            fontFamily: "'Nunito', sans-serif", fontWeight: 'bold',
            background: i === round ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.05)',
            border: i < round ? '2px solid #4CAF50' : i === round ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.1)',
            color: i < round ? '#4CAF50' : i === round ? '#FFD700' : '#546E7A',
          }}>
            {i < round ? '✓ ' : ''}Round {i + 1}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 500 }}>
        {words.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < currentIndex ? '#4CAF50' : i === currentIndex ? '#FFD700' : 'rgba(255,255,255,0.15)',
          }} />
        ))}
      </div>

      {currentWord && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <p style={{ color: '#B0BEC5', fontSize: 18, fontFamily: "'Nunito', sans-serif" }}>
            Read this word!
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 24,
            padding: '32px 40px 24px', border: '2px solid rgba(76, 175, 80, 0.2)',
          }}>
            <WordWithDots sounds={currentWord.sounds} recorder={recorder} dotColor="#4CAF50" suffix={currentWord.suffix} />
          </div>

          <ParentRating onRate={handleRate} />

          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              style={{ ...btnStyle, opacity: currentIndex === 0 ? 0.3 : 1 }}
            >← Prev</button>
            <button onClick={() => {
              if (currentIndex < words.length - 1) setCurrentIndex(currentIndex + 1);
              else setRoundComplete(true);
            }} style={btnStyle}>Skip →</button>
          </div>
        </div>
      )}

      <SpaceCelebration rating={celebrationRating} onComplete={handleCelebrationComplete} />
      {showStreakCelebration && (
        <StreakCelebration streak={streak} onComplete={() => {
          dismissStreakCelebration();
          handleCelebrationComplete();
        }} />
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12, color: '#fff', padding: '8px 16px', cursor: 'pointer',
  fontSize: 14, fontFamily: "'Nunito', sans-serif",
};
