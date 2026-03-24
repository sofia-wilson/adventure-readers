import { useContext, useMemo } from 'react';
import { getUnitById, units, getBlendingWordsForUnit, getSentencesForUnit } from '../data/curriculum';
import { getSoundCardsForUnit } from '../data/soundCards';
import { getPhoneticHFWForUnit, getTrueTrickWordsForUnit } from '../data/trickWords';
import ProfileContext from '../components/ProfileContext';

interface UnitScreenProps {
  unitId: string;
  onBack: () => void;
  onActivity: (activity: string) => void;
}

interface ActivityDef {
  emoji: string;
  label: string;
  description: string;
}

const activityInfo: Record<string, ActivityDef> = {
  sound_drill: {
    emoji: '🔊',
    label: 'Sound Drill',
    description: 'Tap cards to hear each sound',
  },
  blending: {
    emoji: '🚀',
    label: 'Blending Launchpad',
    description: 'Blend sounds and build words!',
  },
  phonetic_hfw: {
    emoji: '📖',
    label: 'Regular Words',
    description: 'Words you can sound out — they follow the rules!',
  },
  trick_word: {
    emoji: '✨',
    label: 'Trick Words',
    description: 'Words you just have to know!',
  },
  blending_review: {
    emoji: '🔄',
    label: 'Blending Review',
    description: 'Read words from all units — dots to help you blend!',
  },
  trick_review: {
    emoji: '⚡',
    label: 'Trick Word Snap',
    description: 'Read trick words as fast as you can!',
  },
  unit_sentences: {
    emoji: '📖',
    label: 'Read Sentences',
    description: 'Practice reading sentences with this unit\'s sounds!',
  },
  sentences: {
    emoji: '📚',
    label: 'Read Sentences',
    description: 'Read real sentences with pictures!',
  },
};

// Group activities into sections
interface Section {
  header?: string;
  subtitle?: string;
  activities: string[];
}

function getSections(activities: string[]): Section[] {
  const blending = activities.filter(a => a === 'sound_drill' || a === 'blending');
  const hfw = activities.filter(a => a === 'phonetic_hfw' || a === 'trick_word');
  const unitSentences = activities.filter(a => a === 'unit_sentences');
  const standalone = activities.filter(a =>
    a === 'blending_review' || a === 'trick_review' || a === 'sentences'
  );

  const sections: Section[] = [];

  if (blending.length > 0) {
    sections.push({ activities: blending });
  }

  if (hfw.length > 0) {
    sections.push({
      header: 'Read High Frequency Words',
      subtitle: 'Practice reading words quickly and automatically',
      activities: hfw,
    });
  }

  if (unitSentences.length > 0) {
    sections.push({
      header: 'Read Sentences',
      subtitle: 'Put it all together — read sentences with this unit\'s sounds!',
      activities: unitSentences,
    });
  }

  if (standalone.length > 0) {
    sections.push({ activities: standalone });
  }

  return sections;
}

function getActivityMastery(childId: string, unitId: string): Record<string, boolean> {
  try {
    const data = localStorage.getItem(`space-reader-progress-${childId}`);
    if (!data) return {};
    const attempts: Array<{ unitId: string; activityType: string; itemId: string; rating: string }> = JSON.parse(data);
    const unitAttempts = attempts.filter(a => a.unitId === unitId);
    if (unitAttempts.length === 0) return {};

    const result: Record<string, boolean> = {};

    // Sound Drill
    const soundCards = getSoundCardsForUnit(unitId);
    if (soundCards.length > 0) {
      const soundAttempts = unitAttempts.filter(a => a.activityType === 'sound_drill');
      const allAttempted = soundCards.every(c => soundAttempts.some(a => a.itemId === c.id));
      if (allAttempted) {
        const allGreen = soundCards.every(c => {
          const ca = soundAttempts.filter(a => a.itemId === c.id);
          return ca.length > 0 && ca[ca.length - 1].rating === 'green';
        });
        result['sound_drill'] = allGreen;
      }
    }

    // Blending
    const blendWords = getBlendingWordsForUnit(unitId);
    if (blendWords.length > 0) {
      const blendAttempts = unitAttempts.filter(a => a.activityType === 'blending');
      const allAttempted = blendWords.every(w => blendAttempts.some(a => a.itemId === w.word));
      if (allAttempted) {
        const allGreen = blendWords.every(w => {
          const wa = blendAttempts.filter(a => a.itemId === w.word);
          return wa.length > 0 && wa[wa.length - 1].rating === 'green';
        });
        result['blending'] = allGreen;
      }
    }

    // Trick words (covers both phonetic_hfw and trick_word)
    const trickAttempts = unitAttempts.filter(a => a.activityType === 'trick_word');

    const phoneticWords = getPhoneticHFWForUnit(unitId);
    if (phoneticWords.length > 0) {
      const allAttempted = phoneticWords.every(w =>
        trickAttempts.some(a => a.itemId === `hfw-${w.word}` || a.itemId === w.word)
      );
      if (allAttempted) {
        const allGreen = phoneticWords.every(w => {
          const wa = trickAttempts.filter(a => a.itemId === `hfw-${w.word}` || a.itemId === w.word);
          return wa.length > 0 && wa[wa.length - 1].rating === 'green';
        });
        result['phonetic_hfw'] = allGreen;
      }
    }

    const trickWords = getTrueTrickWordsForUnit(unitId);
    if (trickWords.length > 0) {
      const allAttempted = trickWords.every(w =>
        trickAttempts.some(a => a.itemId === `trick-${w.word}` || a.itemId === w.word)
      );
      if (allAttempted) {
        const allGreen = trickWords.every(w => {
          const wa = trickAttempts.filter(a => a.itemId === `trick-${w.word}` || a.itemId === w.word);
          return wa.length > 0 && wa[wa.length - 1].rating === 'green';
        });
        result['trick_word'] = allGreen;
      }
    }

    // Sentences
    const unitSentences = getSentencesForUnit(unitId);
    if (unitSentences.length > 0) {
      const allAttempted = unitSentences.every((_, i) =>
        unitAttempts.some(a => a.itemId === `sentence-${i}`)
      );
      if (allAttempted) {
        const allGreen = unitSentences.every((_, i) => {
          const sa = unitAttempts.filter(a => a.itemId === `sentence-${i}`);
          return sa.length > 0 && sa[sa.length - 1].rating === 'green';
        });
        result['unit_sentences'] = allGreen;
      }
    }

    return result;
  } catch {
    return {};
  }
}

export default function UnitScreen({ unitId, onBack, onActivity }: UnitScreenProps) {
  const profile = useContext(ProfileContext);
  const childId = profile?.childId || 'default';
  const theme = profile?.theme;
  const unit = getUnitById(unitId);
  if (!unit) return null;
  const unitIdx = units.findIndex(u => u.id === unitId);

  const mastery = useMemo(() => getActivityMastery(childId, unitId), [childId, unitId]);
  const sections = getSections(unit.activities);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px',
      minHeight: '100vh',
    }}>
      <button onClick={onBack} style={backBtnStyle}>← Back to Map</button>

      {/* Planet header */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${(theme?.unitColors[unitIdx] || unit.planetColor)}ee, ${(theme?.unitColors[unitIdx] || unit.planetColor)}88)`,
        boxShadow: `0 0 30px ${(theme?.unitColors[unitIdx] || unit.planetColor)}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        margin: '20px 0 16px',
      }}>
        {theme?.titleEmojis[0] || '🪐'}
      </div>

      <h2 style={{
        color: theme?.accentColor || '#FFD700',
        fontFamily: "'Nunito', sans-serif",
        fontSize: 28,
        margin: '0 0 4px',
      }}>
        {(theme?.unitNames[unitIdx]) || unit.planetName}
      </h2>
      <p style={{
        color: '#B0BEC5',
        fontSize: 16,
        margin: '0 0 8px',
        fontFamily: "'Nunito', sans-serif",
      }}>
        {unit.name} — {unit.description}
      </p>

      <p style={{
        color: '#78909C',
        fontSize: 14,
        marginBottom: 24,
        fontFamily: "'Nunito', sans-serif",
      }}>
        Choose an activity to explore!
      </p>

      {/* Sections */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        maxWidth: 420,
      }}>
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {/* Section header */}
            {section.header && (
              <div style={{
                marginTop: sIdx > 0 ? 16 : 0,
                marginBottom: 8,
                paddingLeft: 4,
              }}>
                <h3 style={{
                  color: '#FFD700',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 16,
                  margin: '0 0 2px',
                }}>
                  {section.header}
                </h3>
                {section.subtitle && (
                  <p style={{
                    color: '#78909C',
                    fontSize: 12,
                    margin: 0,
                    fontStyle: 'italic',
                  }}>
                    {section.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Activity buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.activities.map(activity => {
                const rawInfo = activityInfo[activity];
                const info = activity === 'blending' && theme
                  ? { ...rawInfo, label: theme.blendingLabel, emoji: theme.blendingEmoji }
                  : rawInfo;
                const isMastered = mastery[activity] === true;
                return (
                  <button
                    key={activity}
                    onClick={() => onActivity(activity)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      borderRadius: 18,
                      border: isMastered
                        ? '2px solid rgba(76, 175, 80, 0.6)'
                        : '2px solid rgba(255,255,255,0.12)',
                      background: isMastered
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 0.1s, background 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = isMastered ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255,255,255,0.1)';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = isMastered ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{info.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        color: '#fff',
                        fontSize: 17,
                        fontWeight: 'bold',
                        fontFamily: "'Nunito', sans-serif",
                        display: 'block',
                      }}>
                        {info.label}
                        {isMastered && (
                          <span style={{
                            color: '#4CAF50',
                            fontSize: 12,
                            fontWeight: 'normal',
                            marginLeft: 8,
                          }}>
                            ✓ Mastered!
                          </span>
                        )}
                      </span>
                      <span style={{
                        color: '#B0BEC5',
                        fontSize: 12,
                        fontFamily: "'Nunito', sans-serif",
                      }}>
                        {info.description}
                      </span>
                    </div>
                    <span style={{ fontSize: 20, color: isMastered ? '#4CAF50' : 'rgba(255,255,255,0.25)' }}>
                      {isMastered ? '✓' : '→'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12,
  color: '#fff',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: "'Nunito', sans-serif",
  alignSelf: 'flex-start',
};
