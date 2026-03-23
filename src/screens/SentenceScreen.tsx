import { useState, useCallback } from 'react';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import WordWithDots from '../components/WordWithDots';
import { sentences, getSentencesForUnit } from '../data/curriculum';
import type { SentenceWord } from '../data/curriculum';
import { playGotItSound } from '../audio/soundEffects';
import type { Rating } from '../types';
import type { Recorder } from '../hooks/useRecorder';

// Decodable reader tips per unit
const DECODABLE_TIPS: Record<string, string> = {
  'K-U2': 'Your child can now practice with Level A decodable readers — simple CVC word books like "The cat sat on the mat."',
  'K-U3': 'Try decodable readers with digraph words (sh, ch, th, wh) — your child is ready!',
  'K-U4': 'Look for decodable readers that include words with double letters (ff, ll, ss) — great practice!',
  'K-U5': 'Your child can read words with glued sounds (am, an) — find decodable readers with these patterns!',
  'K-U6': 'Try decodable readers with simple plural words (dogs, cats, maps) — your child can handle the suffix -s!',
  'K-U7': 'Your child is ready for decodable readers with ng and nk words — they\'re building a strong foundation!',
};

interface SentenceScreenProps {
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
  unitId?: string; // if provided, show only sentences for this unit
}

function ScaffoldedWord({ word, recorder }: { word: SentenceWord; recorder: Recorder }) {
  // Strip punctuation from display text for the scaffolded view
  const cleanText = word.text.replace(/[.,!?]/g, '');
  const lookupText = cleanText.toLowerCase();
  const punctuation = word.text.slice(cleanText.length);

  // Star button (shared by all word types)
  const starButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        recorder.playWordRecording(lookupText);
      }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 16, padding: 0, marginTop: 2,
        filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.4))',
      }}
    >
      ⭐
    </button>
  );

  if (word.type === 'trick') {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '4px 2px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{
          fontSize: 32, fontWeight: 'bold', color: '#FFD700',
          fontFamily: "'Comic Sans MS', cursive",
          borderBottom: '2px dashed rgba(255, 215, 0, 0.4)',
          paddingBottom: 2,
          lineHeight: 1,
        }}>
          {cleanText}{punctuation}
        </span>
        {/* Spacer to align with phonetic words that have dots */}
        <div style={{ height: 24 }} />
        {starButton}
      </div>
    );
  }

  // Phonetic or suffix words: show with dots + star to hear whole word
  if (word.sounds) {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <WordWithDots
          sounds={word.sounds}
          dotColor={word.type === 'suffix' ? '#4CAF50' : '#4FC3F7'}
          recorder={recorder}
          fontSize={32}
          suffix={word.suffix}
        />
        {starButton}
      </div>
    );
  }

  return <span>{word.text}</span>;
}

export default function SentenceScreen({ onBack, onRate, recorder, unitId }: SentenceScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const filteredSentences = unitId ? getSentencesForUnit(unitId) : sentences.filter(s => s.unit === 'K-U10');
  const ratingUnitId = unitId || 'K-U10';

  const current = filteredSentences[currentIndex];

  const handleRate = useCallback((rating: Rating) => {
    if (!current) return;
    onRate(ratingUnitId, `sentence-${currentIndex}`, rating);
    if (rating === 'green') playGotItSound();
    setCelebrationRating(rating);
  }, [current, currentIndex, onRate]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationRating(null);
    if (currentIndex < filteredSentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(filteredSentences.length - 1, prev + 1));
    setFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setFlipped(false);
  };

  // Build plain text from words
  const _sentenceText = current?.words.map(w => w.text).join(' ') || '';
  void _sentenceText;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', minHeight: '100vh',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 600, marginBottom: 20,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <h2 style={{ color: '#FFD700', fontFamily: "'Comic Sans MS', cursive", fontSize: 24, margin: 0 }}>
          📚 Read Sentences
        </h2>
        <span style={{ color: '#B0BEC5', fontSize: 14 }}>{currentIndex + 1} / {filteredSentences.length}</span>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {filteredSentences.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < currentIndex ? '#4CAF50' : i === currentIndex ? '#FFD700' : 'rgba(255,255,255,0.15)',
          }} />
        ))}
      </div>

      {current && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <p style={{ color: '#B0BEC5', fontSize: 16, fontFamily: "'Comic Sans MS', cursive" }}>
            Can you read this sentence?
          </p>

          {/* Sentence card — tappable to flip */}
          <button
            onClick={() => setFlipped(!flipped)}
            style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 28,
              padding: '36px 44px',
              border: flipped
                ? '2px solid rgba(79, 195, 247, 0.4)'
                : '2px solid rgba(255, 215, 0, 0.2)',
              maxWidth: 520, width: '100%', textAlign: 'center',
              cursor: 'pointer', transition: 'border-color 0.3s',
            }}
          >
            {!flipped ? (
              /* === FRONT: Plain sentence === */
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>
                  {current.emoji}
                </div>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                  gap: 12, lineHeight: 1.4,
                }}>
                  {current.words.map((word, i) => (
                    <span key={i} style={{
                      fontSize: 36, fontWeight: 'bold', color: '#fff',
                      fontFamily: "'Comic Sans MS', cursive",
                    }}>
                      {word.text}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              /* === BACK: Scaffolded breakdown === */
              <>
                <p style={{
                  color: '#4FC3F7', fontSize: 14, marginBottom: 16,
                  fontFamily: "'Comic Sans MS', cursive", fontStyle: 'italic',
                }}>
                  Sound it out! Tap each letter for help.
                </p>
                <div style={{
                  display: 'flex', justifyContent: 'center',
                  gap: 10, alignItems: 'flex-start',
                }}>
                  {current.words.map((word, i) => (
                    <ScaffoldedWord key={i} word={word} recorder={recorder} />
                  ))}
                </div>
              </>
            )}
          </button>

          {!flipped && (
            <p style={{
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              fontFamily: "'Comic Sans MS', cursive", fontStyle: 'italic',
            }}>
              Need help? Tap the card to see sounds
            </p>
          )}
          {flipped && (
            <p style={{
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              fontFamily: "'Comic Sans MS', cursive", fontStyle: 'italic',
            }}>
              Tap card again to hide hints
            </p>
          )}

          <ParentRating onRate={handleRate} />

          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{ ...btnStyle, opacity: currentIndex === 0 ? 0.3 : 1 }}
            >← Prev</button>
            {currentIndex === filteredSentences.length - 1 ? (
              <button onClick={() => {
                if (unitId && DECODABLE_TIPS[unitId]) {
                  setShowTip(true);
                } else {
                  setShowCompletion(true);
                }
              }} style={{ ...btnStyle, background: 'rgba(76,175,80,0.3)', borderColor: '#4CAF50' }}>
                Done! 🎉
              </button>
            ) : (
              <button onClick={handleNext} style={btnStyle}>Skip →</button>
            )}
          </div>
        </div>
      )}

      <SpaceCelebration rating={celebrationRating} onComplete={handleCelebrationComplete} />

      {/* Decodable reader tip overlay (per-unit) */}
      {showTip && unitId && DECODABLE_TIPS[unitId] && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1a237e 0%, #0d1b3e 100%)',
            borderRadius: 28, padding: '36px 28px',
            maxWidth: 420, width: '100%', textAlign: 'center',
            border: '2px solid rgba(79, 195, 247, 0.4)',
            boxShadow: '0 0 40px rgba(79, 195, 247, 0.15)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📚🌟</div>
            <h2 style={{
              color: '#FFD700', fontFamily: "'Comic Sans MS', cursive",
              fontSize: 22, marginBottom: 12, lineHeight: 1.3,
            }}>
              Great reading!
            </h2>
            <p style={{
              color: '#E0E0E0', fontSize: 15, lineHeight: 1.7,
              fontFamily: "'Comic Sans MS', cursive", marginBottom: 20,
            }}>
              {DECODABLE_TIPS[unitId]}
            </p>
            <p style={{
              color: '#78909C', fontSize: 12, lineHeight: 1.5,
              fontStyle: 'italic', marginBottom: 24,
            }}>
              Tip for parents: decodable readers match the phonics skills your child is learning — look for books that practice this unit's sounds!
            </p>
            <button
              onClick={onBack}
              style={{
                ...btnStyle,
                background: 'rgba(76, 175, 80, 0.3)',
                borderColor: '#4CAF50',
                padding: '12px 32px',
                fontSize: 16,
              }}
            >
              🏠 Back to Unit
            </button>
          </div>
        </div>
      )}

      {/* Milestone completion overlay */}
      {showCompletion && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1a237e 0%, #0d1b3e 100%)',
            borderRadius: 28, padding: '40px 32px',
            maxWidth: 460, width: '100%', textAlign: 'center',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 0 60px rgba(255, 215, 0, 0.15)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉🌟🚀</div>
            <h2 style={{
              color: '#FFD700', fontFamily: "'Comic Sans MS', cursive",
              fontSize: 26, marginBottom: 16, lineHeight: 1.3,
            }}>
              Amazing Work!
            </h2>
            <p style={{
              color: '#E0E0E0', fontSize: 16, lineHeight: 1.7,
              fontFamily: "'Comic Sans MS', cursive", marginBottom: 24,
            }}>
              Your child has been reading words, blending sounds, and practicing sentences
              — they now have a strong foundation in early literacy!
            </p>
            <p style={{
              color: '#4FC3F7', fontSize: 15, lineHeight: 1.6,
              fontFamily: "'Comic Sans MS', cursive", marginBottom: 32,
            }}>
              They're ready to start practicing with decodable Level A/B books at home.
              Keep the reading adventures going! 📖✨
            </p>
            <button
              onClick={onBack}
              style={{
                ...btnStyle,
                background: 'rgba(76, 175, 80, 0.3)',
                borderColor: '#4CAF50',
                padding: '12px 32px',
                fontSize: 18,
              }}
            >
              Back to Home 🏠
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12, color: '#fff', padding: '8px 16px', cursor: 'pointer',
  fontSize: 14, fontFamily: "'Comic Sans MS', cursive",
};
