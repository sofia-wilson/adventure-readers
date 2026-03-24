import { useState, useCallback, useEffect, useContext } from 'react';
import ParentRating from '../components/ParentRating';
import SpaceCelebration from '../components/SpaceCelebration';
import ProfileContext from '../components/ProfileContext';
import WordWithDots from '../components/WordWithDots';
import { getBlendingWordsForUnit, getUnitById } from '../data/curriculum';
import { playGotItSound, playNotQuiteSound } from '../audio/soundEffects';
import StreakCelebration from '../components/StreakCelebration';
import { useStreak } from '../hooks/useStreak';
import { useSessionResume } from '../hooks/useSessionResume';
import type { Recorder } from '../hooks/useRecorder';
import type { Rating } from '../types';

interface BlendingScreenProps {
  unitId: string;
  onBack: () => void;
  onRate: (unitId: string, itemId: string, rating: Rating) => void;
  recorder: Recorder;
}

function playRecordingAsync(recorder: Recorder, soundId: string): Promise<void> {
  return new Promise((resolve) => {
    if (recorder.hasRecording(soundId)) {
      recorder.playRecording(soundId);
      setTimeout(resolve, 800);
    } else {
      resolve();
    }
  });
}

// Phase 1: I Do (build), Phase 2: We Do (listen together), Phase 3: You Do (independent)
type Phase = 'i_do' | 'blending' | 'we_do' | 'you_do';

export default function BlendingScreen({ unitId, onBack, onRate, recorder }: BlendingScreenProps) {
  const profile = useContext(ProfileContext);
  const childId = profile?.childId || 'default';
  const theme = profile?.theme;
  const unit = getUnitById(unitId);
  const allWords = getBlendingWordsForUnit(unitId);

  const { saveProgress } = useSessionResume(childId, unitId, 'blending');

  // Adaptive: read attempts from localStorage, find resume point or unmastered words
  const [{ words, startIndex, allMastered: initialAllMastered }] = useState(() => {
    const storedAttempts: Array<{ unitId: string; activityType: string; itemId: string; rating: string }> = (() => {
      try {
        const data = localStorage.getItem(`space-reader-progress-${childId}`);
        return data ? JSON.parse(data) : [];
      } catch { return []; }
    })();

    const unitAttempts = storedAttempts.filter(
      (a: { unitId: string; activityType: string }) => a.unitId === unitId && a.activityType === 'blending'
    );

    // Has every word been attempted?
    const allAttempted = allWords.every(w =>
      unitAttempts.some((a: { itemId: string }) => a.itemId === w.word)
    );

    if (!allAttempted) {
      // Find the first word not yet attempted — resume from there
      const firstUnattempted = allWords.findIndex(w =>
        !unitAttempts.some((a: { itemId: string }) => a.itemId === w.word)
      );
      return { words: allWords, startIndex: Math.max(0, firstUnattempted), allMastered: false };
    }

    // All attempted — find unmastered
    const unmastered = allWords.filter(w => {
      const wordAttempts = unitAttempts.filter((a: { itemId: string }) => a.itemId === w.word);
      if (wordAttempts.length === 0) return true;
      return wordAttempts[wordAttempts.length - 1].rating !== 'green';
    });

    if (unmastered.length === 0) {
      return { words: allWords, startIndex: 0, allMastered: true };
    }

    return { words: unmastered, startIndex: 0, allMastered: false };
  });

  const [showMastered, setShowMastered] = useState(initialAllMastered);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [phase, setPhase] = useState<Phase>('i_do');
  // Initialize blending mat for the starting word directly
  const initialWord = words[startIndex];
  const [droppedSounds, setDroppedSounds] = useState<(string | null)[]>(
    initialWord ? new Array(initialWord.sounds.length).fill(null) : []
  );
  const [blendHighlight, setBlendHighlight] = useState(-1);
  const [celebrationRating, setCelebrationRating] = useState<Rating | null>(null);
  const [availableSounds, setAvailableSounds] = useState<string[]>(
    initialWord ? [...initialWord.sounds] : []
  );
  const { streak, showStreakCelebration, recordRating, dismissStreakCelebration } = useStreak();

  // Save progress on position/phase change
  useEffect(() => {
    saveProgress({ currentIndex, phase });
  }, [currentIndex, phase, saveProgress]);

  const currentWord = words[currentIndex];

  const initWord = useCallback((idx: number) => {
    if (idx >= words.length) return;
    const word = words[idx];
    setDroppedSounds(new Array(word.sounds.length).fill(null));
    setPhase('i_do');
    setBlendHighlight(-1);
    setAvailableSounds([...word.sounds]);
  }, [words]);

  // No useEffect needed — initial state set directly in useState above

  const handleSoundTap = (sound: string) => {
    const emptyIdx = droppedSounds.indexOf(null);
    if (emptyIdx === -1) return;

    const newDropped = [...droppedSounds];
    newDropped[emptyIdx] = sound;
    setDroppedSounds(newDropped);

    const newAvail = [...availableSounds];
    const availIdx = newAvail.indexOf(sound);
    if (availIdx !== -1) newAvail.splice(availIdx, 1);
    setAvailableSounds(newAvail);

    recorder.playRecording(sound);

    if (newDropped.every(s => s !== null)) {
      setTimeout(() => handleBlend(newDropped as string[]), 600);
    }
  };

  const handleBlend = async (sounds: string[]) => {
    if (!currentWord) return;
    setPhase('blending');

    for (let i = 0; i < sounds.length; i++) {
      setBlendHighlight(i);
      await playRecordingAsync(recorder, sounds[i]);
      await new Promise(r => setTimeout(r, 200));
    }

    setBlendHighlight(-1);
    await new Promise(r => setTimeout(r, 400));
    setPhase('we_do');
  };

  const handlePlayBlended = async () => {
    if (!currentWord) return;

    // For suffix words, try to play the special "blend:word" recording first
    if (currentWord.suffix) {
      const played = recorder.playRecording(`blend:${currentWord.word}`);
      if (played) return;
    }

    // Fallback: play each sound individually
    for (const sound of currentWord.sounds) {
      await playRecordingAsync(recorder, sound);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handleRate = useCallback((rating: Rating) => {
    if (!currentWord) return;
    onRate(unitId, currentWord.word, rating);
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
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      initWord(nextIdx);
      saveProgress({ currentIndex: nextIdx, phase: 'i_do' });
    }
  }, [currentIndex, words.length, initWord, saveProgress]);

  const handleReset = () => { initWord(currentIndex); };

  const goToCard = (idx: number) => {
    setCurrentIndex(idx);
    initWord(idx);
  };

  if (!unit || words.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
        <p>No blending words for this unit yet.</p>
        <button onClick={onBack} style={btnStyle}>Back to Map</button>
      </div>
    );
  }

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
          All Words Mastered!
        </h2>
        <p style={{
          color: '#B0BEC5', fontSize: 16, textAlign: 'center',
          fontFamily: "'Nunito', sans-serif", maxWidth: 300,
        }}>
          {allWords.length}/{allWords.length} blending words — amazing work!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <button onClick={() => setShowMastered(false)} style={{
            background: 'rgba(79, 195, 247, 0.15)',
            border: '2px solid rgba(79, 195, 247, 0.4)',
            borderRadius: 14, color: '#4FC3F7', padding: '14px 32px',
            cursor: 'pointer', fontSize: 16, fontWeight: 'bold',
            fontFamily: "'Nunito', sans-serif",
          }}>
            🔄 Review All Words
          </button>
          <button onClick={onBack} style={{ ...btnStyle, fontSize: 16, padding: '14px 32px' }}>
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
        width: '100%', maxWidth: 600, marginBottom: 20,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            color: theme?.accentColor || '#FFD700', fontFamily: "'Nunito', sans-serif",
            fontSize: 24, margin: 0,
          }}>
            {theme?.blendingEmoji || '🚀'} {theme?.blendingLabel || 'Blending Launchpad'}
          </h2>
          <p style={{ color: '#B0BEC5', fontSize: 13, margin: '4px 0 0' }}>
            {unit.name} — Build the word!
          </p>
        </div>
        <span style={{ color: '#B0BEC5', fontSize: 14 }}>
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 24,
        flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400,
      }}>
        {words.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < currentIndex ? '#4CAF50'
              : i === currentIndex ? '#FFD700' : 'rgba(255,255,255,0.2)',
          }} />
        ))}
      </div>

      {currentWord && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>

          {/* ===== PHASE 1: I DO ===== */}
          {(phase === 'i_do' || phase === 'blending') && (
            <>
              <p style={{
                color: '#B0BEC5', fontSize: 16,
                fontFamily: "'Nunito', sans-serif",
              }}>
                {phase === 'blending' ? 'Listen...' : 'Tap each sound to build the word:'}
              </p>

              {/* Blending Mat */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 24,
                padding: '28px 36px', border: '2px solid rgba(255,255,255,0.1)',
                minWidth: 300,
              }}>
                {/* Arrow */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.4)',
                  }} />
                  <div style={{
                    flex: 1, height: 4, background: 'rgba(255,255,255,0.2)',
                    borderRadius: 2, position: 'relative',
                  }}>
                    {phase === 'blending' && blendHighlight >= 0 && (
                      <div style={{
                        position: 'absolute',
                        left: `${(blendHighlight / currentWord.sounds.length) * 100}%`,
                        width: `${100 / currentWord.sounds.length}%`,
                        height: 60, top: -28,
                        background: 'rgba(255, 215, 0, 0.15)',
                        borderRadius: 12, transition: 'left 0.4s ease-in-out',
                      }} />
                    )}
                  </div>
                  <div style={{
                    width: 0, height: 0,
                    borderTop: '8px solid transparent', borderBottom: '8px solid transparent',
                    borderLeft: '14px solid rgba(255,255,255,0.4)',
                  }} />
                </div>

                {/* Slots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {currentWord.sounds.map((_, i) => (
                    <button key={i}
                      onClick={() => {
                        if (droppedSounds[i] && phase !== 'blending')
                          recorder.playRecording(droppedSounds[i]!);
                      }}
                      disabled={!droppedSounds[i] || phase === 'blending'}
                      style={{
                        width: 72, height: 72, borderRadius: 14,
                        border: droppedSounds[i] ? '3px solid #4FC3F7' : '3px dashed rgba(255,255,255,0.3)',
                        background: droppedSounds[i] ? 'rgba(79, 195, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: 'bold', color: '#fff',
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow: blendHighlight === i ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                        cursor: droppedSounds[i] ? 'pointer' : 'default',
                      }}
                    >
                      {droppedSounds[i]?.replace(/^-/, '') || '•'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                  <button onClick={handleReset} style={{ ...btnStyle, fontSize: 12, padding: '6px 14px' }}>
                    🔄 Reset
                  </button>
                </div>
              </div>

              {/* Available tiles */}
              {phase === 'i_do' && availableSounds.length > 0 && (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {availableSounds.map((sound, i) => (
                    <button key={`${sound}-${i}`}
                      onClick={() => handleSoundTap(sound)}
                      style={{
                        width: 64, height: 64, borderRadius: 14,
                        border: '3px solid #CE93D8', background: 'rgba(206, 147, 216, 0.15)',
                        color: '#fff', fontSize: 26, fontWeight: 'bold',
                        cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                      }}
                      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)'; }}
                      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                    >
                      {sound.replace(/^-/, '')}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===== PHASE 2: WE DO ===== */}
          {phase === 'we_do' && (
            <>
              <p style={{
                color: '#FFD700', fontSize: 20,
                fontFamily: "'Nunito', sans-serif", fontWeight: 'bold',
              }}>
                We do! 👂
              </p>

              {/* Word with dots — tap to hear whole word recording */}
              <button
                onClick={() => {
                  const played = recorder.playWordRecording(currentWord.word);
                  if (!played) {
                    // Fallback: play each sound individually
                    handlePlayBlended();
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)', borderRadius: 24,
                  padding: '32px 40px 24px',
                  border: '2px solid rgba(255, 215, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <WordWithDots sounds={currentWord.sounds} dotColor="#FFD700" suffix={currentWord.suffix} />
                <p style={{
                  color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10,
                  textAlign: 'center', fontStyle: 'italic',
                }}>
                  tap to hear the word
                </p>
              </button>

              {/* Hear it blended button — below word card with spacing */}
              <div style={{ marginTop: 16 }}>
                <button onClick={handlePlayBlended} style={{
                  background: 'rgba(79, 195, 247, 0.15)',
                  border: '2px solid rgba(79, 195, 247, 0.4)',
                  borderRadius: 14, color: '#fff', padding: '12px 24px',
                  cursor: 'pointer', fontSize: 15,
                  fontFamily: "'Nunito', sans-serif",
                }}>
                  🔊 Hear it blended slowly — then you say it fast!
                </button>
              </div>

              {/* Parent tip — first word only */}
              {currentIndex === 0 && (
                <div style={{
                  background: 'rgba(255, 215, 0, 0.08)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: 10, padding: '8px 14px', marginTop: 4,
                  maxWidth: 340,
                }}>
                  <p style={{
                    color: 'rgba(255, 215, 0, 0.7)', fontSize: 12, margin: 0,
                    fontFamily: "'Nunito', sans-serif", fontStyle: 'italic',
                    textAlign: 'center',
                  }}>
                    💡 Tip: After hearing it blended slowly, encourage your child to "say it fast" — the whole word at once. If they still space out the sounds, play the blend again or tap the word card for a hint.
                  </p>
                </div>
              )}

              {/* Next step */}
              <button onClick={() => { setPhase('you_do'); saveProgress({ currentIndex, phase: 'you_do' }); }} style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                borderRadius: 14, color: '#FFD700', padding: '12px 24px',
                cursor: 'pointer', fontSize: 15, fontWeight: 'bold',
                fontFamily: "'Nunito', sans-serif",
              }}>
                Ready? Your turn! →
              </button>
            </>
          )}

          {/* ===== PHASE 3: YOU DO ===== */}
          {phase === 'you_do' && (
            <>
              <p style={{
                color: '#FFD700', fontSize: 20,
                fontFamily: "'Nunito', sans-serif", fontWeight: 'bold',
              }}>
                Your turn! 🌟
              </p>
              <p style={{
                color: '#B0BEC5', fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                textAlign: 'center', maxWidth: 320,
              }}>
                Run your finger under each dot as you read the word
              </p>

              {/* Word with dots — tappable letters if stuck */}
              <div style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 24,
                padding: '32px 40px 24px',
                border: '2px solid rgba(76, 175, 80, 0.2)',
              }}>
                <WordWithDots sounds={currentWord.sounds} recorder={recorder} dotColor="#4CAF50" suffix={currentWord.suffix} />
              </div>

              {/* Rating */}
              <div style={{ marginTop: 8 }}>
                <ParentRating onRate={handleRate} />
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button
              onClick={() => {
                if (phase === 'you_do') {
                  // You Do → back to We Do (same word)
                  setPhase('we_do');
                } else if (phase === 'we_do') {
                  // We Do → back to I Do (same word, re-build)
                  initWord(currentIndex);
                } else if (phase === 'i_do' || phase === 'blending') {
                  // I Do → back to previous word's You Do
                  if (currentIndex > 0) {
                    const prevIdx = currentIndex - 1;
                    setCurrentIndex(prevIdx);
                    const prevWord = words[prevIdx];
                    setDroppedSounds(prevWord.sounds.map(s => s));
                    setAvailableSounds([]);
                    setPhase('you_do');
                    setBlendHighlight(-1);
                  }
                }
              }}
              disabled={currentIndex === 0 && (phase === 'i_do' || phase === 'blending')}
              style={{ ...btnStyle, opacity: (currentIndex === 0 && (phase === 'i_do' || phase === 'blending')) ? 0.3 : 1 }}
            >
              ← Prev
            </button>
            {currentIndex === words.length - 1 && phase === 'you_do' ? (
              <button onClick={onBack} style={{
                ...btnStyle, background: 'rgba(76, 175, 80, 0.3)', borderColor: '#4CAF50',
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
  borderRadius: 12, color: '#fff',
  padding: '8px 16px', cursor: 'pointer',
  fontSize: 14, fontFamily: "'Nunito', sans-serif",
};
