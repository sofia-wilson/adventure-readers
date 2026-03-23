import { useEffect, useState, useContext } from 'react';
import ProfileContext from './ProfileContext';

interface StreakCelebrationProps {
  streak: number;
  onComplete: () => void;
}

const defaultCelebrations = [
  { emoji: '🌟', bg: '#FFD700' },
  { emoji: '🚀', bg: '#4FC3F7' },
  { emoji: '🪐', bg: '#CE93D8' },
  { emoji: '💫', bg: '#FF8A65' },
  { emoji: '🌌', bg: '#81C784' },
  { emoji: '☄️', bg: '#FFD54F' },
  { emoji: '🏅', bg: '#4FC3F7' },
  { emoji: '⭐', bg: '#FFD700' },
];

import { getAudioContext } from '../audio/soundEffects';
import { getRecording } from '../hooks/audioStorage';

// Play a fun celebration jingle
function playStreakSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Quick ascending arpeggio — do mi sol do!
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });

    // Shimmer layer
    for (let i = 0; i < 8; i++) {
      const shimmer = ctx.createOscillator();
      const sGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = 2000 + Math.random() * 3000;
      const t = 0.4 + i * 0.06;
      sGain.gain.setValueAtTime(0.06, now + t);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);
      shimmer.connect(sGain);
      sGain.connect(ctx.destination);
      shimmer.start(now + t);
      shimmer.stop(now + t + 0.15);
    }

    // Whoosh
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);
    filter.Q.value = 1;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.08, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.5);
  } catch {
    // Audio not available
  }
}

// Generate confetti particles
interface Confetti {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  drift: number;
  rotation: number;
}

function generateConfetti(count: number): Confetti[] {
  const colors = ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784', '#CE93D8', '#FF8A65', '#FFD54F', '#EF5350'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 10,
    delay: Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 60,
    rotation: Math.random() * 360,
  }));
}

async function playParentCelebration(childId?: string) {
  try {
    const key = childId
      ? `celebration-${childId}`
      : 'celebration-goodjob';
    const dataUrl = await getRecording(key);
    if (dataUrl) {
      const audio = new Audio(dataUrl);
      audio.play().catch(() => {});
    }
  } catch { /* */ }
}

export default function StreakCelebration({ streak, onComplete }: StreakCelebrationProps) {
  const profile = useContext(ProfileContext);
  const celebrations = profile?.theme?.streakEmojis || defaultCelebrations;
  const [visible, setVisible] = useState(true);
  const [confetti] = useState(() => generateConfetti(30));

  const celIndex = Math.floor((streak / 3) - 1) % celebrations.length;
  const cel = celebrations[celIndex];

  useEffect(() => {
    playStreakSound();
    // Play parent's "Great job!" recording after a short delay so it layers nicely
    const voiceTimer = setTimeout(() => playParentCelebration(profile?.childId), 400);
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2800);
    return () => { clearTimeout(timer); clearTimeout(voiceTimer); };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999, pointerEvents: 'none',
      background: 'rgba(0,0,0,0.3)',
    }}>
      {/* Confetti rain */}
      {confetti.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          left: `${c.x}%`,
          top: -20,
          width: c.size,
          height: c.size * 0.6,
          background: c.color,
          borderRadius: 2,
          animation: `confettiFall 2s ease-in ${c.delay}s forwards`,
          opacity: 0,
          transform: `rotate(${c.rotation}deg)`,
          ['--drift' as string]: `${c.drift}px`,
        }} />
      ))}

      {/* Star burst from center */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 80 + Math.random() * 100;
        return (
          <div key={`star-${i}`} style={{
            position: 'absolute',
            left: '50%', top: '50%',
            fontSize: 16 + Math.random() * 20,
            animation: `streakStar 1.2s ease-out ${i * 0.03}s forwards`,
            opacity: 0,
            ['--dx' as string]: `${Math.cos(rad) * dist}px`,
            ['--dy' as string]: `${Math.sin(rad) * dist}px`,
          }}>
            {(profile?.theme?.celebrationEmojis || ['⭐', '🌟', '✨', '💫', '🔥'])[i % (profile?.theme?.celebrationEmojis?.length || 5)]}
          </div>
        );
      })}

      {/* Glowing circle pulse */}
      <div style={{
        position: 'absolute',
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${cel.bg}33, transparent)`,
        animation: 'glowPulse 1s ease-out',
      }} />

      {/* Main emoji — big and bouncy */}
      <div style={{
        fontSize: 100,
        animation: 'streakBounce 0.6s ease-out',
        filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))',
      }}>
        {cel.emoji}
      </div>

      {/* Streak count — big for non-readers */}
      <div style={{
        fontSize: 48, fontWeight: 'bold', color: '#FFD700',
        fontFamily: "'Nunito', sans-serif",
        animation: 'streakFadeIn 0.4s ease-out 0.3s both',
        textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 4px 8px rgba(0,0,0,0.5)',
      }}>
        {streak}🔥
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); }
        }
        @keyframes streakStar {
          0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(0.3); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.5); }
        }
        @keyframes streakBounce {
          0% { transform: scale(0) rotate(-20deg); }
          40% { transform: scale(1.4) rotate(5deg); }
          60% { transform: scale(0.85) rotate(-3deg); }
          80% { transform: scale(1.1) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes streakFadeIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.5); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
