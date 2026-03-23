import { useState, useContext } from 'react';
import { soundCards } from '../data/soundCards';
import { blendingWords, getPhoneticSentenceWords } from '../data/curriculum';
import { trickWords } from '../data/trickWords';
import ProfileContext from '../components/ProfileContext';
import type { Recorder } from '../hooks/useRecorder';
import { isStopConsonant } from '../audio/speechUtils';

interface SetupScreenProps {
  onBack: () => void;
  onComplete: () => void;
  recorder: Recorder;
}

const soundGuides: Record<string, string> = {
  'b': '/b/ — lips pop, no "uh"',
  'c': '/k/ — back of tongue, no "uh"',
  'd': '/d/ — tongue taps roof, no "uh"',
  'f': '/f/ — teeth on lip, blow air',
  'g': '/g/ — back of throat, no "uh"',
  'h': '/h/ — gentle breath out',
  'j': '/j/ — quick, no "uh"',
  'k': '/k/ — back of tongue, no "uh"',
  'l': '/l/ — tongue behind teeth',
  'm': '/m/ — lips together, hum',
  'n': '/n/ — tongue behind teeth, hum',
  'p': '/p/ — lips pop, no "uh"',
  'qu': '/kw/ — quick lip round',
  'r': '/r/ — tongue curls back',
  's': '/s/ — teeth together, hiss',
  't': '/t/ — tongue taps roof, no "uh"',
  'v': '/v/ — teeth on lip, buzz',
  'w': '/w/ — lips round',
  'x': '/ks/ — quick combo',
  'y': '/y/ — tongue up front',
  'z': '/z/ — teeth together, buzz',
  'a': '/a/ as in apple — "ah"',
  'e': '/e/ as in Ed — "eh"',
  'i': '/i/ as in itch — "ih"',
  'o': '/o/ as in octopus — "aw"',
  'u': '/u/ as in up — "uh"',
  'wh': '/wh/ as in whistle',
  'ch': '/ch/ as in chin',
  'sh': '/sh/ as in ship',
  'th': '/th/ as in thumb',
  'ck': '/k/ as in sock',
  'ff': '/f/ — sustained',
  'll': '/l/ — sustained',
  'ss': '/s/ — sustained',
  'zz': '/z/ — sustained',
  'all': 'say "all" as one sound',
  'am': 'say "am" as one sound',
  'an': 'say "an" as one sound',
  'ang': 'say "ang" as one sound',
  'ing': 'say "ing" as one sound',
  'ong': 'say "ong" as one sound',
  'ung': 'say "ung" as one sound',
  'ank': 'say "ank" as one sound',
  'ink': 'say "ink" as one sound',
  'onk': 'say "onk" as one sound',
  'unk': 'say "unk" as one sound',
};

interface SoundGroup {
  title: string;
  description: string;
  emoji: string;
  ids: string[];
}

const groups: SoundGroup[] = [
  {
    title: 'Consonants',
    description: 'Say each sound short and clipped — no added "uh"!',
    emoji: '🔤',
    ids: soundCards.filter(c => c.type === 'consonant').map(c => c.id),
  },
  {
    title: 'Short Vowels',
    description: 'Say each vowel sound clearly and short',
    emoji: '🌟',
    ids: soundCards.filter(c => c.type === 'short_vowel').map(c => c.id),
  },
  {
    title: 'Digraphs',
    description: 'Two letters that make one sound',
    emoji: '🔗',
    ids: soundCards.filter(c => c.type === 'digraph').map(c => c.id),
  },
  {
    title: 'Bonus Letters',
    description: 'Double letters at the end of words',
    emoji: '✨',
    ids: soundCards.filter(c => c.type === 'bonus_letter').map(c => c.id),
  },
  {
    title: 'Glued Sounds',
    description: 'Say these letter combinations as one sound — never separate them',
    emoji: '🧲',
    ids: soundCards.filter(c => c.type === 'glued_sound').map(c => c.id),
  },
  {
    title: 'Suffixes',
    description: 'Say a quick /s/ sound — as the final sound in "sits"',
    emoji: '➕',
    ids: soundCards.filter(c => c.type === 'suffix').map(c => c.id),
  },
];

export default function SetupScreen({ onBack, onComplete, recorder }: SetupScreenProps) {
  const profile = useContext(ProfileContext);
  const childName = profile?.childName || 'your child';
  const theme = profile?.theme;
  const accentColor = theme?.accentColor || '#FFD700';
  const setupLabel = theme?.setupLabel || 'Mission Control';
  const setupEmoji = theme?.setupEmoji || '🎙️';

  const recordedCount = recorder.getRecordedCount();
  const totalCount = recorder.getTotalSoundCount();
  const childId = profile?.childId || 'default';
  const allDone = recorder.isSetupComplete(childId);
  const celebrationId = `celebration-${childId}`;
  const hasCelebration = recorder.hasRecording(celebrationId);
  const isRecordingCelebration = recorder.currentRecordingId === celebrationId;
  const [showSoundsSection, setShowSoundsSection] = useState(false);

  const handleRecord = (id: string) => {
    recorder.startRecording(id);
  };

  const handleStop = () => {
    recorder.stopRecording();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px 60px',
      minHeight: '100vh',
      maxWidth: 700,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <h2 style={{
          color: accentColor,
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: 24,
          margin: 0,
        }}>
          {setupEmoji} {setupLabel}
        </h2>
        <div style={{ width: 70 }} />
      </div>

      {/* ===== CELEBRATION RECORDING — Primary action ===== */}
      <div style={{
        width: '100%',
        borderRadius: 20,
        border: hasCelebration
          ? '3px solid #4CAF50'
          : `3px solid ${accentColor}`,
        background: hasCelebration
          ? 'rgba(76, 175, 80, 0.08)'
          : `${accentColor}0f`,
        padding: '24px 20px',
        marginBottom: 28,
        textAlign: 'center',
      }}>
        <h3 style={{
          color: accentColor,
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: 20,
          margin: '0 0 8px',
        }}>
          🎉 Record a celebration!
        </h3>
        <p style={{
          color: '#B0BEC5',
          fontSize: 14,
          fontFamily: "'Comic Sans MS', cursive",
          marginBottom: 16,
          lineHeight: 1.5,
        }}>
          Say <strong style={{ color: '#fff' }}>"Great job, {childName}!"</strong> so your child hears <em>your</em> voice when they get an answer right.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {isRecordingCelebration ? (
            <button onClick={handleStop} style={{
              ...recBtnStyle('#EF5350'),
              width: 56, height: 56, fontSize: 24,
              animation: 'pulse 1s ease-in-out infinite',
            }}>
              ⏹
            </button>
          ) : hasCelebration ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => recorder.playRecording(celebrationId)}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                  border: 'none',
                  borderRadius: 16,
                  color: '#fff',
                  padding: '14px 32px',
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: "'Comic Sans MS', cursive",
                  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                }}
              >
                ▶ Play back your recording
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleRecord(celebrationId)}
                  disabled={recorder.isRecording}
                  style={recBtnStyle('#78909C')}
                  title="Re-record"
                >
                  🎙️ ↻
                </button>
                <span style={{ color: '#4CAF50', fontSize: 14, fontFamily: "'Comic Sans MS', cursive" }}>✓ Recorded!</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleRecord(celebrationId)}
              disabled={recorder.isRecording}
              style={{
                ...recBtnStyle(accentColor),
                width: 56, height: 56, fontSize: 24,
              }}
              title="Record celebration"
            >
              🎙️
            </button>
          )}
        </div>
      </div>

      {/* Microphone error */}
      {recorder.error && (
        <p style={{
          color: '#EF5350',
          fontSize: 13,
          background: 'rgba(239, 83, 80, 0.1)',
          border: '1px solid rgba(239, 83, 80, 0.3)',
          borderRadius: 10,
          padding: '10px 16px',
          maxWidth: 500,
          textAlign: 'center',
          marginBottom: 12,
        }}>
          {recorder.error}
        </p>
      )}

      {/* ===== PRE-RECORDED SOUNDS SECTION ===== */}
      <div style={{
        width: '100%',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 16px',
        marginBottom: 24,
      }}>
        <p style={{
          color: '#B0BEC5',
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 1.5,
          fontFamily: "'Comic Sans MS', cursive",
          marginBottom: 12,
        }}>
          All sounds for this curriculum have been pre-recorded to be phonetically correct.
          If you'd like to re-record a sound with your own voice, you can do so below.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowSoundsSection(!showSoundsSection)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, color: '#B0BEC5',
              padding: '8px 20px', cursor: 'pointer',
              fontSize: 13, fontFamily: "'Comic Sans MS', cursive",
            }}
          >
            {showSoundsSection ? '▲ Hide sounds & words' : '▼ View & re-record sounds and words'}
          </button>
        </div>

        {/* Progress bar */}
        {showSoundsSection && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <span style={{ color: '#B0BEC5', fontSize: 13 }}>Recordings</span>
              <span style={{
                color: allDone ? '#4CAF50' : accentColor,
                fontSize: 13,
                fontWeight: 'bold',
              }}>
                {recordedCount} / {totalCount} sounds
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 10,
              borderRadius: 5,
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(recordedCount / totalCount) * 100}%`,
                height: '100%',
                borderRadius: 5,
                background: allDone
                  ? '#4CAF50'
                  : `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)`,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Sound groups — collapsible */}
      {showSoundsSection && (
        <>

      {groups.map(group => {
        const groupRecorded = group.ids.filter(id => recorder.hasRecording(id)).length;
        const groupDone = groupRecorded === group.ids.length;

        return (
          <div key={group.title} style={{
            width: '100%',
            marginBottom: 24,
          }}>
            {/* Group header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 22 }}>{group.emoji}</span>
              <h3 style={{
                color: groupDone ? '#4CAF50' : '#fff',
                fontFamily: "'Comic Sans MS', cursive",
                fontSize: 18,
                margin: 0,
              }}>
                {group.title}
                {groupDone && ' ✓'}
              </h3>
              <span style={{ color: '#78909C', fontSize: 12, marginLeft: 'auto' }}>
                {groupRecorded}/{group.ids.length}
              </span>
            </div>
            <p style={{
              color: '#78909C',
              fontSize: 12,
              marginBottom: 12,
              fontStyle: 'italic',
            }}>
              {group.description}
            </p>

            {/* Sound cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 10,
            }}>
              {group.ids.map(id => {
                const card = soundCards.find(c => c.id === id)!;
                const recorded = recorder.hasRecording(id);
                const isCurrentlyRecording = recorder.currentRecordingId === id;
                const guide = soundGuides[id];
                const isStop = isStopConsonant(id);

                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 14,
                      border: recorded
                        ? '2px solid rgba(76, 175, 80, 0.4)'
                        : '2px solid rgba(255,255,255,0.1)',
                      background: recorded
                        ? 'rgba(76, 175, 80, 0.08)'
                        : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* Letter card — tap to play recording */}
                    <button
                      onClick={() => recorded && recorder.playRecording(id)}
                      disabled={!recorded}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: recorded ? '#4CAF5033' : '#4FC3F733',
                        border: recorded ? '2px solid #4CAF50' : '2px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: recorded ? 'pointer' : 'default',
                        transition: 'transform 0.1s',
                        position: 'relative',
                      }}
                      onMouseDown={e => { if (recorded) (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)'; }}
                      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                      title={recorded ? 'Tap to play recording' : 'Record first'}
                    >
                      <span style={{ fontSize: 14 }}>{card.emoji}</span>
                      <span style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: '#fff',
                        lineHeight: 1,
                      }}>
                        {card.grapheme}
                      </span>
                      {/* Play icon overlay when recorded */}
                      {recorded && (
                        <span style={{
                          position: 'absolute',
                          bottom: 1,
                          right: 2,
                          fontSize: 10,
                          opacity: 0.7,
                        }}>
                          🔊
                        </span>
                      )}
                    </button>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 'bold',
                        fontFamily: "'Comic Sans MS', cursive",
                      }}>
                        {card.keyword}
                        {isStop && <span style={{ color: '#FFD54F', fontSize: 10, marginLeft: 6 }}>⚠️ clip it!</span>}
                      </div>
                      <div style={{
                        color: '#78909C',
                        fontSize: 11,
                        lineHeight: 1.3,
                      }}>
                        {guide}
                      </div>
                      {recorded && (
                        <div style={{ color: '#4CAF50', fontSize: 10, marginTop: 2 }}>
                          Tap letter to hear playback
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                      {isCurrentlyRecording ? (
                        <button onClick={handleStop} style={{
                          ...recBtnStyle('#EF5350'),
                          width: 44,
                          height: 44,
                          fontSize: 18,
                          animation: 'pulse 1s ease-in-out infinite',
                        }}>
                          ⏹
                        </button>
                      ) : recorded ? (
                        <>
                          <button
                            onClick={() => handleRecord(id)}
                            disabled={recorder.isRecording}
                            style={recBtnStyle('#78909C')}
                            title="Re-record"
                          >
                            🎙️ ↻
                          </button>
                          <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRecord(id)}
                          disabled={recorder.isRecording}
                          style={{
                            ...recBtnStyle('#4CAF50'),
                            width: 44,
                            height: 44,
                            fontSize: 18,
                          }}
                          title="Record"
                        >
                          🎙️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* === Word Recordings — grouped by unit === */}
      {(() => {
        const wordUnits = [
          { id: 'K-U2', label: 'Unit 2 Words — CVC' },
          { id: 'K-U3', label: 'Unit 3 Words — Digraphs' },
          { id: 'K-U4', label: 'Unit 4 Words — Bonus Letters' },
          { id: 'K-U5', label: 'Unit 5 Words — Glued Sounds' },
          { id: 'K-U6', label: 'Unit 6 Words — Suffix -s' },
          { id: 'K-U7', label: 'Unit 7 Words — ng & nk' },
        ];

        return wordUnits.map(wu => {
          const unitWords = blendingWords.filter(w => w.unit === wu.id);
          if (unitWords.length === 0) return null;
          const wordsRecorded = unitWords.filter(w => recorder.hasWordRecording(w.word)).length;

          return (
            <div key={wu.id} style={{ width: '100%', marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
              }}>
                <span style={{ fontSize: 22 }}>📝</span>
                <h3 style={{
                  color: wordsRecorded === unitWords.length ? '#4CAF50' : '#fff',
                  fontFamily: "'Comic Sans MS', cursive", fontSize: 18, margin: 0,
                }}>
                  {wu.label}
                  {wordsRecorded === unitWords.length && ' ✓'}
                </h3>
                <span style={{ color: '#78909C', fontSize: 12, marginLeft: 'auto' }}>
                  {wordsRecorded}/{unitWords.length}
                </span>
              </div>
              <p style={{
                color: '#78909C', fontSize: 12, marginBottom: 12, fontStyle: 'italic',
              }}>
                {wu.id === 'K-U6'
                  ? 'Record each word AND a "blended slowly" version (e.g., "s-i-t... sit... s... sits")'
                  : 'Say each word clearly — your child will hear this in the "We Do" step'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 8,
              }}>
                {unitWords.map(w => {
                  const wordRecorded = recorder.hasWordRecording(w.word);
                  const isRecordingThis = recorder.currentRecordingId === `word:${w.word}`;
                  const blendId = `blend:${w.word}`;
                  const blendRecorded = w.suffix ? recorder.hasRecording(blendId) : false;
                  const isRecordingBlend = w.suffix ? recorder.currentRecordingId === blendId : false;

                  return (
                    <div key={w.word} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {/* Whole word recording */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 12,
                        border: wordRecorded
                          ? '2px solid rgba(76, 175, 80, 0.4)'
                          : '2px solid rgba(255,255,255,0.1)',
                        background: wordRecorded
                          ? 'rgba(76, 175, 80, 0.08)'
                          : 'rgba(255,255,255,0.04)',
                      }}>
                        <button
                          onClick={() => wordRecorded && recorder.playWordRecording(w.word)}
                          disabled={!wordRecorded}
                          style={{
                            background: 'none', border: 'none',
                            color: '#fff', fontSize: 20, fontWeight: 'bold',
                            fontFamily: "'Comic Sans MS', cursive",
                            cursor: wordRecorded ? 'pointer' : 'default',
                            flex: 1, textAlign: 'left', padding: 0,
                          }}
                        >
                          {w.word}
                        </button>

                        {isRecordingThis ? (
                          <button onClick={handleStop} style={{
                            ...recBtnStyle('#EF5350'),
                            animation: 'pulse 1s ease-in-out infinite',
                          }}>
                            ⏹
                          </button>
                        ) : (
                          <button
                            onClick={() => recorder.startWordRecording(w.word)}
                            disabled={recorder.isRecording}
                            style={recBtnStyle(wordRecorded ? '#78909C' : '#4CAF50')}
                          >
                            {wordRecorded ? '↻' : '🎙️'}
                          </button>
                        )}

                        {wordRecorded && (
                          <span style={{ color: '#4CAF50', fontSize: 14 }}>✓</span>
                        )}
                      </div>

                      {/* Blended slowly recording — only for suffix words */}
                      {w.suffix && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '6px 12px', borderRadius: 10, marginLeft: 16,
                          border: blendRecorded
                            ? '2px solid rgba(255, 138, 101, 0.4)'
                            : '2px solid rgba(255,255,255,0.08)',
                          background: blendRecorded
                            ? 'rgba(255, 138, 101, 0.08)'
                            : 'rgba(255,255,255,0.02)',
                        }}>
                          <span style={{
                            color: '#FF8A65', fontSize: 12,
                            fontFamily: "'Comic Sans MS', cursive",
                            flex: 1,
                          }}>
                            🔊 blended slowly
                          </span>

                          {isRecordingBlend ? (
                            <button onClick={handleStop} style={{
                              ...recBtnStyle('#EF5350'),
                              width: 28, height: 28, fontSize: 12,
                              animation: 'pulse 1s ease-in-out infinite',
                            }}>
                              ⏹
                            </button>
                          ) : (
                            <button
                              onClick={() => recorder.startRecording(blendId)}
                              disabled={recorder.isRecording}
                              style={{ ...recBtnStyle(blendRecorded ? '#78909C' : '#FF8A65'), width: 28, height: 28, fontSize: 12 }}
                            >
                              {blendRecorded ? '↻' : '🎙️'}
                            </button>
                          )}

                          {blendRecorded && (
                            <button
                              onClick={() => recorder.playRecording(blendId)}
                              style={{
                                background: 'none', border: 'none',
                                color: '#FF8A65', fontSize: 14, cursor: 'pointer', padding: 0,
                              }}
                            >
                              ▶
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        });
      })()}

      {/* === HFW Recordings === */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', marginTop: 32, marginBottom: 16,
          }}>
            <span style={{ fontSize: 22 }}>📖</span>
            <h2 style={{
              color: accentColor, fontFamily: "'Comic Sans MS', cursive",
              fontSize: 22, margin: 0,
            }}>
              High Frequency Words
            </h2>
          </div>
          <p style={{
            color: '#78909C', fontSize: 13, marginBottom: 16, fontStyle: 'italic',
            width: '100%',
          }}>
            Record each word clearly — your child can tap ⭐ to hear these during sentence reading
          </p>

          {(() => {
            const hfwUnits = [
              { id: 'K-U2', label: 'Unit 2 — Regular HFW', phonetic: true },
              { id: 'K-U2', label: 'Unit 2 — Trick Words', phonetic: false },
              { id: 'K-U3', label: 'Unit 3 — Regular HFW', phonetic: true },
              { id: 'K-U3', label: 'Unit 3 — Trick Words', phonetic: false },
              { id: 'K-U4', label: 'Unit 4 — Trick Words', phonetic: false },
              { id: 'K-U5', label: 'Unit 5 — Trick Words', phonetic: false },
              { id: 'K-U6', label: 'Unit 6 — Trick Words', phonetic: false },
              { id: 'K-U7', label: 'Unit 7 — Trick Words', phonetic: false },
            ];

            return hfwUnits.map((hu, idx) => {
              const words = trickWords.filter(w => w.unit === hu.id && w.phonetic === hu.phonetic);
              if (words.length === 0) return null;
              const recorded = words.filter(w => recorder.hasWordRecording(w.word)).length;

              return (
                <div key={`${hu.id}-${hu.phonetic}-${idx}`} style={{ width: '100%', marginBottom: 20 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{hu.phonetic ? '🔤' : '⭐'}</span>
                    <h3 style={{
                      color: recorded === words.length ? '#4CAF50' : '#fff',
                      fontFamily: "'Comic Sans MS', cursive", fontSize: 16, margin: 0,
                    }}>
                      {hu.label}
                      {recorded === words.length && ' ✓'}
                    </h3>
                    <span style={{ color: '#78909C', fontSize: 12, marginLeft: 'auto' }}>
                      {recorded}/{words.length}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 8,
                  }}>
                    {words.map(w => {
                      const isRecorded = recorder.hasWordRecording(w.word);
                      const isRecordingThis = recorder.currentRecordingId === `word:${w.word}`;

                      return (
                        <div key={w.word} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', borderRadius: 10,
                          border: isRecorded
                            ? '2px solid rgba(76, 175, 80, 0.4)'
                            : '2px solid rgba(255,255,255,0.1)',
                          background: isRecorded
                            ? 'rgba(76, 175, 80, 0.08)'
                            : 'rgba(255,255,255,0.04)',
                        }}>
                          <span style={{
                            color: '#fff', fontSize: 18, fontWeight: 'bold',
                            fontFamily: "'Comic Sans MS', cursive",
                            flex: 1,
                          }}>
                            {w.word}
                          </span>

                          {/* Play button */}
                          {isRecorded && !isRecordingThis && (
                            <button
                              onClick={() => recorder.playWordRecording(w.word)}
                              style={{
                                background: 'none', border: 'none',
                                color: '#4CAF50', fontSize: 16, cursor: 'pointer', padding: 0,
                              }}
                            >
                              ▶
                            </button>
                          )}

                          {/* Record / Re-record / Stop */}
                          {isRecordingThis ? (
                            <button onClick={handleStop} style={{
                              ...recBtnStyle('#EF5350'),
                              width: 28, height: 28, fontSize: 12,
                              animation: 'pulse 1s ease-in-out infinite',
                            }}>
                              ⏹
                            </button>
                          ) : (
                            <button
                              onClick={() => recorder.startWordRecording(w.word)}
                              disabled={recorder.isRecording}
                              style={{ ...recBtnStyle(isRecorded ? '#78909C' : '#4CAF50'), width: 28, height: 28, fontSize: 12 }}
                            >
                              {isRecorded ? '↻' : '🎙️'}
                            </button>
                          )}

                          {isRecorded && (
                            <span style={{ color: '#4CAF50', fontSize: 12 }}>✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}

      {/* === Sentence Words Recording === */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', marginTop: 32, marginBottom: 16,
          }}>
            <span style={{ fontSize: 22 }}>📚</span>
            <h2 style={{
              color: accentColor, fontFamily: "'Comic Sans MS', cursive",
              fontSize: 22, margin: 0,
            }}>
              Sentence Reading Words (Phonetic)
            </h2>
          </div>
          <p style={{
            color: '#78909C', fontSize: 13, marginBottom: 16, fontStyle: 'italic',
            width: '100%',
          }}>
            Record each word clearly — your child can tap ⭐ to hear these during sentence reading (Unit 10). Trick words are already recorded above in the HFW section.
          </p>

          {(() => {
            const sentenceWordList = getPhoneticSentenceWords();
            const recorded = sentenceWordList.filter(w => recorder.hasWordRecording(w)).length;

            return (
              <div style={{ width: '100%', marginBottom: 20 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                }}>
                  <h3 style={{
                    color: recorded === sentenceWordList.length ? '#4CAF50' : '#fff',
                    fontFamily: "'Comic Sans MS', cursive", fontSize: 16, margin: 0,
                  }}>
                    Phonetic Words for Sentences
                    {recorded === sentenceWordList.length && ' ✓'}
                  </h3>
                  <span style={{ color: '#78909C', fontSize: 12, marginLeft: 'auto' }}>
                    {recorded}/{sentenceWordList.length}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 8,
                }}>
                  {sentenceWordList.map(w => {
                    const isRecorded = recorder.hasWordRecording(w);
                    const isRecordingThis = recorder.currentRecordingId === `word:${w}`;

                    return (
                      <div key={w} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px', borderRadius: 10,
                        border: isRecorded
                          ? '2px solid rgba(76, 175, 80, 0.4)'
                          : '2px solid rgba(255,255,255,0.1)',
                        background: isRecorded
                          ? 'rgba(76, 175, 80, 0.08)'
                          : 'rgba(255,255,255,0.04)',
                      }}>
                        <span style={{
                          color: '#fff', fontSize: 18, fontWeight: 'bold',
                          fontFamily: "'Comic Sans MS', cursive",
                          flex: 1,
                        }}>
                          {w}
                        </span>

                        {isRecorded && !isRecordingThis && (
                          <button
                            onClick={() => recorder.playWordRecording(w)}
                            style={{
                              background: 'none', border: 'none',
                              color: '#4CAF50', fontSize: 16, cursor: 'pointer', padding: 0,
                            }}
                          >
                            ▶
                          </button>
                        )}

                        {isRecordingThis ? (
                          <button onClick={handleStop} style={{
                            ...recBtnStyle('#EF5350'),
                            width: 28, height: 28, fontSize: 12,
                            animation: 'pulse 1s ease-in-out infinite',
                          }}>
                            ⏹
                          </button>
                        ) : (
                          <button
                            onClick={() => recorder.startWordRecording(w)}
                            disabled={recorder.isRecording}
                            style={{ ...recBtnStyle(isRecorded ? '#78909C' : '#4CAF50'), width: 28, height: 28, fontSize: 12 }}
                          >
                            {isRecorded ? '↻' : '🎙️'}
                          </button>
                        )}

                        {isRecorded && (
                          <span style={{ color: '#4CAF50', fontSize: 12 }}>✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Done button */}
      <div style={{
        position: 'sticky',
        bottom: 16,
        padding: '12px 0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}>
        {hasCelebration ? (
          <button
            onClick={onComplete}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              padding: '16px 48px',
              cursor: 'pointer',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: "'Comic Sans MS', cursive",
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
            }}
          >
            {theme?.titleEmojis[0] || '🚀'} Start Learning!
          </button>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 24px',
            color: '#B0BEC5',
            fontSize: 14,
            fontFamily: "'Comic Sans MS', cursive",
            textAlign: 'center',
          }}>
            Record your celebration message above to get started!
          </div>
        )}
      </div>
    </div>
  );
}

function recBtnStyle(color: string): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: `2px solid ${color}`,
    background: `${color}22`,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12,
  color: '#fff',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: "'Comic Sans MS', cursive",
};
