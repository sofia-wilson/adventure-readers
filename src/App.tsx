import { useState, useCallback } from 'react';
import UnitMap from './components/UnitMap';
import ProfileContext from './components/ProfileContext';
import ProfileSelectScreen from './screens/ProfileSelectScreen';
import SoundDrillScreen from './screens/SoundDrillScreen';
import BlendingScreen from './screens/BlendingScreen';
import TrickWordScreen from './screens/TrickWordScreen';
import UnitScreen from './screens/UnitScreen';
import DashboardScreen from './screens/DashboardScreen';
import SetupScreen from './screens/SetupScreen';
import PhoneticWordScreen from './screens/PhoneticWordScreen';
import BlendingReviewScreen from './screens/BlendingReviewScreen';
import TrickReviewScreen from './screens/TrickReviewScreen';
import SentenceScreen from './screens/SentenceScreen';
import { useProgress } from './hooks/useProgress';
import { useRecorder } from './hooks/useRecorder';
import { useProfiles, type ChildProfile } from './hooks/useProfiles';
import { getTheme } from './data/themes';
import type { ThemeConfig } from './data/themes';
import type { Rating } from './types';

type Screen =
  | { type: 'profile_select' }
  | { type: 'home' }
  | { type: 'setup' }
  | { type: 'unit'; unitId: string }
  | { type: 'sound_drill'; unitId: string }
  | { type: 'blending'; unitId: string }
  | { type: 'phonetic_hfw'; unitId: string }
  | { type: 'trick_word'; unitId: string }
  | { type: 'unit_sentences'; unitId: string }
  | { type: 'blending_review' }
  | { type: 'trick_review' }
  | { type: 'sentences' }
  | { type: 'dashboard' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'profile_select' });
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const profileHook = useProfiles();
  const recorder = useRecorder();

  const handleSelectProfile = useCallback((profile: ChildProfile) => {
    setActiveChild(profile);
    setScreen({ type: 'home' });
  }, []);

  const handleSwitchProfile = useCallback(() => {
    setActiveChild(null);
    setScreen({ type: 'profile_select' });
  }, []);

  const theme = activeChild ? getTheme(activeChild.theme) : getTheme('space');

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bgGradient,
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Star background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              borderRadius: '50%',
              background: theme.bgParticleColor,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {screen.type === 'profile_select' && (
          <ProfileSelectScreen
            profiles={profileHook.profiles}
            onSelect={handleSelectProfile}
            onAddProfile={profileHook.addProfile}
            onRemoveProfile={profileHook.removeProfile}
            onUpdateProfile={profileHook.updateProfile}
            verifyPin={profileHook.verifyPin}
          />
        )}

        {activeChild && screen.type !== 'profile_select' && (
          <ProfileContext.Provider value={{
            childId: activeChild.id,
            childName: activeChild.name,
            theme,
            switchProfile: handleSwitchProfile,
          }}>
            <MainContent
              key={activeChild.id}
              childId={activeChild.id}
              screen={screen}
              setScreen={setScreen}
              recorder={recorder}
              onSwitchProfile={handleSwitchProfile}
            />
          </ProfileContext.Provider>
        )}
      </div>

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.3); }
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          margin: 0;
          background: ${theme.bgBodyColor};
        }
        button:focus {
          outline: 2px solid #FFD700;
          outline-offset: 2px;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 83, 80, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 83, 80, 0); }
        }
      `}</style>
    </div>
  );
}

/** Inner component keyed on childId so hooks remount per child */
function MainContent({
  childId,
  screen,
  setScreen,
  recorder,
  onSwitchProfile,
}: {
  childId: string;
  screen: Screen;
  setScreen: (s: Screen) => void;
  recorder: ReturnType<typeof useRecorder>;
  onSwitchProfile: () => void;
}) {
  const { recordAttempt, getAllProgress, clearProgress, attempts } = useProgress(childId);

  const handleRate = useCallback((unitId: string, itemId: string, rating: Rating) => {
    const activityType = screen.type === 'sound_drill' ? 'sound_drill'
      : screen.type === 'blending' ? 'blending'
      : 'trick_word';
    recordAttempt(unitId, activityType as 'sound_drill' | 'blending' | 'trick_word', itemId, rating);
  }, [screen.type, recordAttempt]);

  const progress = getAllProgress();

  return (
    <>
      {/* Persistent home button on all pages */}
      <button
        onClick={onSwitchProfile}
        style={{
          position: 'fixed', top: 12, right: 12, zIndex: 900,
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10, color: '#B0BEC5', padding: '6px 12px',
          cursor: 'pointer', fontSize: 13, fontFamily: "'Comic Sans MS', cursive",
          backdropFilter: 'blur(8px)',
        }}
      >
        🏠 Home
      </button>

      {screen.type === 'home' && (
        <>
          <UnitMap
            progress={progress}
            onSelectUnit={(unitId) => setScreen({ type: 'unit', unitId })}
            setupComplete={recorder.isSetupComplete(childId)}
            recordedCount={recorder.getRecordedCount()}
            totalSoundCount={recorder.getTotalSoundCount()}
            onSetup={() => setScreen({ type: 'setup' })}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px 0 40px',
          }}>
            <button
              onClick={() => setScreen({ type: 'dashboard' })}
              style={footerBtn}
            >
              📊 Parent Dashboard
            </button>
          </div>
        </>
      )}

      {screen.type === 'setup' && (
        <SetupScreen
          onBack={() => setScreen({ type: 'home' })}
          onComplete={() => setScreen({ type: 'home' })}
          recorder={recorder}
        />
      )}

      {screen.type === 'unit' && (
        <UnitScreen
          unitId={screen.unitId}
          onBack={() => setScreen({ type: 'home' })}
          onActivity={(activity) => {
            if (activity === 'blending_review' || activity === 'trick_review' || activity === 'sentences') {
              setScreen({ type: activity });
            } else if (activity === 'unit_sentences') {
              setScreen({ type: 'unit_sentences', unitId: screen.unitId });
            } else {
              setScreen({
                type: activity as 'sound_drill' | 'blending' | 'phonetic_hfw' | 'trick_word',
                unitId: screen.unitId,
              });
            }
          }}
        />
      )}

      {screen.type === 'sound_drill' && (
        <SoundDrillScreen
          unitId={screen.unitId}
          onBack={() => setScreen({ type: 'unit', unitId: screen.unitId })}
          onRate={handleRate}
          recorder={recorder}
        />
      )}

      {screen.type === 'blending' && (
        <BlendingScreen
          unitId={screen.unitId}
          onBack={() => setScreen({ type: 'unit', unitId: screen.unitId })}
          onRate={handleRate}
          recorder={recorder}
        />
      )}

      {screen.type === 'phonetic_hfw' && (
        <PhoneticWordScreen
          unitId={screen.unitId}
          onBack={() => setScreen({ type: 'unit', unitId: screen.unitId })}
          onRate={handleRate}
          recorder={recorder}
        />
      )}

      {screen.type === 'trick_word' && (
        <TrickWordScreen
          unitId={screen.unitId}
          onBack={() => setScreen({ type: 'unit', unitId: screen.unitId })}
          onRate={handleRate}
          mode="trick"
          recorder={recorder}
        />
      )}

      {screen.type === 'unit_sentences' && (
        <SentenceScreen
          onBack={() => setScreen({ type: 'unit', unitId: screen.unitId })}
          onRate={handleRate}
          recorder={recorder}
          unitId={screen.unitId}
        />
      )}

      {screen.type === 'blending_review' && (
        <BlendingReviewScreen
          onBack={() => setScreen({ type: 'home' })}
          onRate={handleRate}
          recorder={recorder}
        />
      )}

      {screen.type === 'trick_review' && (
        <TrickReviewScreen
          onBack={() => setScreen({ type: 'home' })}
          onRate={handleRate}
          recorder={recorder}
        />
      )}

      {screen.type === 'sentences' && (
        <SentenceScreen
          onBack={() => setScreen({ type: 'home' })}
          onRate={handleRate}
          recorder={recorder}
        />
      )}

      {screen.type === 'dashboard' && (
        <DashboardScreen
          attempts={attempts}
          onBack={() => setScreen({ type: 'home' })}
          onClearProgress={clearProgress}
        />
      )}
    </>
  );
}

const footerBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '2px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  color: '#B0BEC5',
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: "'Comic Sans MS', cursive",
};
