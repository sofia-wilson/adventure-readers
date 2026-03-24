import { useState, useContext } from 'react';
import { units } from '../data/curriculum';
import ProfileContext from '../components/ProfileContext';
import type { AttemptRecord } from '../types';

interface DashboardScreenProps {
  attempts: AttemptRecord[];
  onBack: () => void;
  onClearProgress: () => void;
}

export default function DashboardScreen({ attempts, onBack, onClearProgress }: DashboardScreenProps) {
  const profile = useContext(ProfileContext);
  const childName = profile?.childName || '';
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Group attempts by unit, then by activity type
  interface ActivityBreakdown {
    label: string;
    mastered: string[];
    needsPractice: string[];
    total: number;
  }

  const unitData = units.map(unit => {
    const unitAttempts = attempts.filter(a => a.unitId === unit.id);

    // Group by activity type
    const byActivity = new Map<string, AttemptRecord[]>();
    for (const a of unitAttempts) {
      if (!byActivity.has(a.activityType)) byActivity.set(a.activityType, []);
      byActivity.get(a.activityType)!.push(a);
    }

    const activityLabels: Record<string, string> = {
      sound_drill: 'Letter Sounds',
      blending: 'Blending',
      trick_word: 'High-Frequency Words',
    };

    const breakdowns: ActivityBreakdown[] = [];

    for (const [actType, actAttempts] of byActivity) {
      const itemMap = new Map<string, Array<'green' | 'yellow' | 'red'>>();
      for (const a of actAttempts) {
        if (!itemMap.has(a.itemId)) itemMap.set(a.itemId, []);
        itemMap.get(a.itemId)!.push(a.rating);
      }

      const mastered: string[] = [];
      const needsPractice: string[] = [];

      for (const [itemId, ratings] of itemMap) {
        const lastRating = ratings[ratings.length - 1];
        const display = itemId.replace('trick-', '').replace('hfw-', '');
        if (lastRating === 'green') {
          mastered.push(display);
        } else {
          needsPractice.push(display);
        }
      }

      breakdowns.push({
        label: activityLabels[actType] || actType,
        mastered,
        needsPractice,
        total: actAttempts.length,
      });
    }

    // Count unique items mastered vs total unique items attempted
    const allItems = new Map<string, string>(); // itemId -> latest rating
    for (const a of unitAttempts) {
      allItems.set(a.itemId, a.rating);
    }
    const uniqueMastered = [...allItems.values()].filter(r => r === 'green').length;
    const uniqueTotal = allItems.size;

    return {
      unit,
      totalAttempts: uniqueTotal,
      greenCount: uniqueMastered,
      breakdowns,
    };
  });

  // Total unique items mastered across all units
  const allItemsGlobal = new Map<string, string>();
  for (const a of attempts) {
    allItemsGlobal.set(`${a.unitId}-${a.itemId}`, a.rating);
  }
  const totalGreen = [...allItemsGlobal.values()].filter(r => r === 'green').length;
  const totalRed = attempts.filter(a => a.rating === 'red').length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', minHeight: '100vh', maxWidth: 700, margin: '0 auto',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 24,
      }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <h2 style={{
          color: '#FFD700', fontFamily: "'Nunito', sans-serif", fontSize: 24, margin: 0,
        }}>
          📊 {childName ? `${childName}'s Progress` : 'Progress Dashboard'}
        </h2>
        <div />
      </div>

      {/* Summary */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 28, width: '100%', justifyContent: 'center',
      }}>
        <div style={statBoxStyle}>
          <span style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>{totalGreen}</span>
          <span style={{ color: '#B0BEC5', fontSize: 12 }}>Got it</span>
        </div>
        <div style={statBoxStyle}>
          <span style={{ fontSize: 28, fontWeight: 'bold', color: '#EF5350' }}>{totalRed}</span>
          <span style={{ color: '#B0BEC5', fontSize: 12 }}>Not quite</span>
        </div>
        <div style={statBoxStyle}>
          <span style={{ fontSize: 28, fontWeight: 'bold', color: '#4FC3F7' }}>{attempts.length}</span>
          <span style={{ color: '#B0BEC5', fontSize: 12 }}>Total</span>
        </div>
      </div>

      {/* Per-unit breakdown */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {unitData.map(({ unit, totalAttempts, greenCount, breakdowns }) => {
          if (totalAttempts === 0) return (
            <div key={unit.id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 14,
              padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ color: '#546E7A', fontSize: 14 }}>
                {unit.name} — {unit.description}
              </span>
              <span style={{ color: '#546E7A', fontSize: 12, float: 'right' }}>Not started</span>
            </div>
          );

          return (
            <div key={unit.id} style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 14,
              padding: '16px', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {/* Unit header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', fontFamily: "'Nunito', sans-serif" }}>
                  {unit.name} — {unit.description}
                </span>
                <span style={{ color: '#B0BEC5', fontSize: 13 }}>
                  {greenCount} mastered / {totalAttempts} practiced
                </span>
              </div>

              {/* Breakdowns by activity type */}
              {breakdowns.map(bd => (
                <div key={bd.label} style={{ marginBottom: 10 }}>
                  <div style={{
                    color: '#FFD700', fontSize: 12, fontWeight: 'bold',
                    marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {bd.label}
                  </div>

                  {bd.mastered.length > 0 && (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: '#4CAF50', fontSize: 11 }}>
                        ✓ Mastered:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                        {bd.mastered.map(item => (
                          <span key={item} style={{
                            background: 'rgba(76, 175, 80, 0.15)',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            borderRadius: 6, padding: '2px 8px',
                            color: '#4CAF50', fontSize: 12, fontWeight: 'bold',
                            fontFamily: "'Nunito', sans-serif",
                          }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bd.needsPractice.length > 0 && (
                    <div>
                      <span style={{ color: '#EF5350', fontSize: 11 }}>
                        ✗ Needs practice:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                        {bd.needsPractice.map(item => (
                          <span key={item} style={{
                            background: 'rgba(239, 83, 80, 0.15)',
                            border: '1px solid rgba(239, 83, 80, 0.3)',
                            borderRadius: 6, padding: '2px 8px',
                            color: '#EF5350', fontSize: 12, fontWeight: 'bold',
                            fontFamily: "'Nunito', sans-serif",
                          }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Next steps note */}
      <div style={{
        background: 'rgba(79, 195, 247, 0.08)',
        border: '1px solid rgba(79, 195, 247, 0.2)',
        borderRadius: 16, padding: '20px 24px',
        marginTop: 32, width: '100%', textAlign: 'center',
      }}>
        <p style={{
          color: '#B0BEC5', fontSize: 14, lineHeight: 1.7,
          fontFamily: "'Nunito', sans-serif", margin: 0,
        }}>
          📚 After completing all units, your child will have a strong foundation
          in early literacy — from letter sounds to blending to reading sentences.
          They'll be ready to start practicing with decodable Level A/B books at home!
        </p>
      </div>

      {/* Clear progress */}
      <div style={{ marginTop: 32, marginBottom: 24 }}>
        {showClearConfirm ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#EF5350', fontSize: 14 }}>Are you sure?</span>
            <button
              onClick={() => { onClearProgress(); setShowClearConfirm(false); }}
              style={{ ...btnStyle, borderColor: '#EF5350', color: '#EF5350' }}>
              Yes, clear all
            </button>
            <button onClick={() => setShowClearConfirm(false)} style={btnStyle}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowClearConfirm(true)}
            style={{ ...btnStyle, borderColor: 'rgba(239,83,80,0.3)', color: '#EF9A9A' }}>
            Clear All Progress
          </button>
        )}
      </div>
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

const statBoxStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 14, padding: '14px 20px',
  textAlign: 'center', display: 'flex',
  flexDirection: 'column', alignItems: 'center', gap: 2,
  border: '1px solid rgba(255,255,255,0.08)',
  minWidth: 80,
};
