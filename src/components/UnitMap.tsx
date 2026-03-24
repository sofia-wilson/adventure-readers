import { useContext } from 'react';
import { units } from '../data/curriculum';
import ProfileContext from './ProfileContext';
import type { UnitProgress } from '../types';

interface UnitMapProps {
  progress: UnitProgress[];
  onSelectUnit: (unitId: string) => void;
  setupComplete: boolean;
  recordedCount: number;
  totalSoundCount: number;
  onSetup: () => void;
}

export default function UnitMap({
  progress, onSelectUnit, setupComplete, recordedCount, totalSoundCount, onSetup,
}: UnitMapProps) {
  const profile = useContext(ProfileContext);
  const childName = profile?.childName || '';
  const theme = profile?.theme;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px',
      gap: 0,
      position: 'relative',
    }}>
      {/* Title */}
      <h1 style={{
        color: theme?.accentColor || '#FFD700',
        fontFamily: "'Nunito', sans-serif",
        fontSize: 36,
        textShadow: `0 0 20px ${theme?.accentColor || '#FFD700'}80`,
        marginBottom: 8,
      }}>
        {theme?.titleEmojis[0] || '🚀'} {theme?.appTitle || 'Adventure Readers'}
      </h1>
      <p style={{
        color: '#B0BEC5',
        fontSize: 16,
        marginBottom: 24,
        fontFamily: "'Nunito', sans-serif",
      }}>
        {theme?.subtitle(childName) || (childName ? `${childName}'s Reading Adventure!` : 'Your reading adventure starts here!')}
      </p>

      {/* Mission Control card */}
      <button
        onClick={onSetup}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          maxWidth: 500,
          padding: '16px 24px',
          borderRadius: 20,
          border: setupComplete
            ? '3px solid #4CAF50'
            : `3px solid ${theme?.accentColor || '#FFD700'}`,
          background: setupComplete
            ? 'rgba(76, 175, 80, 0.1)'
            : `${theme?.accentColor || '#FFD700'}1a`,
          cursor: 'pointer',
          marginBottom: 28,
          transition: 'transform 0.15s',
          textAlign: 'left',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: 40 }}>{theme?.setupEmoji || '🎙️'}</span>
        <div style={{ flex: 1 }}>
          <span style={{
            color: theme?.accentColor || '#FFD700',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: "'Nunito', sans-serif",
            display: 'block',
          }}>
            {theme?.setupLabel || 'Mission Control'}
          </span>
          <span style={{
            color: '#B0BEC5',
            fontSize: 13,
            fontFamily: "'Nunito', sans-serif",
          }}>
            {setupComplete
              ? 'Record a celebration message! You can also re-record sounds in your own voice.'
              : 'Record a personalized celebration message for your reader'}
          </span>

          {/* Mini progress bar */}
          <div style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
            marginTop: 8,
          }}>
            <div style={{
              width: `${(recordedCount / totalSoundCount) * 100}%`,
              height: '100%',
              borderRadius: 3,
              background: setupComplete ? '#4CAF50' : (theme?.accentColor || '#FFD700'),
              transition: 'width 0.4s',
            }} />
          </div>
          <span style={{ color: '#78909C', fontSize: 11, marginTop: 2, display: 'block' }}>
            {recordedCount} / {totalSoundCount} sounds
          </span>
        </div>
        <span style={{ fontSize: 20, color: setupComplete ? '#4CAF50' : (theme?.accentColor || '#FFD700') }}>
          {setupComplete ? '✓' : '→'}
        </span>
      </button>

      {/* Planet path */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 24,
        maxWidth: 900,
        width: '100%',
      }}>
        {units.map((unit, idx) => {
          const unitProgress = progress.find(p => p.unitId === unit.id);
          // All units available once setup is complete
          const unlocked = setupComplete;
          const completed = unitProgress?.completed ?? false;
          const mastery = unitProgress?.mastery ?? 0;

          return (
            <button
              key={unit.id}
              onClick={() => unlocked && onSelectUnit(unit.id)}
              disabled={!unlocked}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: 16,
                borderRadius: 20,
                border: completed
                  ? `3px solid ${theme?.accentColor || '#FFD700'}`
                  : unlocked
                    ? '3px solid rgba(255,255,255,0.3)'
                    : '3px solid rgba(255,255,255,0.1)',
                background: unlocked
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.02)',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.4,
                transition: 'transform 0.15s, box-shadow 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (unlocked) (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {/* Planet */}
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${(theme?.unitColors[idx] || unit.planetColor)}ee, ${(theme?.unitColors[idx] || unit.planetColor)}88)`,
                boxShadow: completed
                  ? `0 0 20px ${(theme?.unitColors[idx] || unit.planetColor)}88, 0 0 40px ${(theme?.unitColors[idx] || unit.planetColor)}44`
                  : `0 4px 12px rgba(0,0,0,0.4)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}>
                {completed ? '✓' : unlocked ? (theme?.titleEmojis[0] || '🪐') : '🔒'}
              </div>

              {/* Unit label */}
              <span style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
              }}>
                {unit.name}
              </span>

              {/* Description */}
              <span style={{
                color: '#B0BEC5',
                fontSize: 11,
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {unit.description}
              </span>

              {/* Mastery bar */}
              {unlocked && unitProgress && unitProgress.totalAttempts > 0 && (
                <div style={{
                  width: '80%',
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.15)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${mastery}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: mastery >= 80 ? '#4CAF50' : mastery >= 50 ? '#FFC107' : '#EF5350',
                    transition: 'width 0.5s',
                  }} />
                </div>
              )}

              {/* Planet number */}
              <span style={{
                position: 'absolute',
                top: 8,
                right: 10,
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11,
              }}>
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next steps note */}
      <p style={{
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        fontFamily: "'Nunito', sans-serif",
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: 360,
        lineHeight: 1.5,
        margin: '20px auto 0',
        padding: '0 16px',
      }}>
        📚 After Unit 10, the reader will be ready for Level A/B/C books — the next step in their reading journey!
      </p>
    </div>
  );
}
