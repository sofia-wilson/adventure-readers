import { useState, useEffect, useCallback } from 'react';
import { getAudioContext } from '../audio/soundEffects';

interface SpacePrizeGameProps {
  unitNumber: number;
  onComplete: (prize: string) => void;
}

const PRIZES = [
  { emoji: '🛸', name: 'Flying Saucer' },
  { emoji: '🌍', name: 'Planet Earth' },
  { emoji: '🌙', name: 'Moon' },
  { emoji: '☀️', name: 'Sun' },
  { emoji: '🛰️', name: 'Satellite' },
  { emoji: '🔭', name: 'Telescope' },
  { emoji: '👨‍🚀', name: 'Astronaut' },
  { emoji: '🌠', name: 'Shooting Star' },
  { emoji: '🪐', name: 'Saturn' },
  { emoji: '🏆', name: 'Space Trophy' },
];

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  popped: boolean;
  size: number;
  speed: number;
}

function playPopSound(pitch: number) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 400 + pitch * 200;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch { /* */ }
}

function playPrizeRevealSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.35);
    });
  } catch { /* */ }
}

const GAME_EMOJIS = ['🚀', '⭐', '🌟', '💫', '✨', '🛸', '🪐', '☄️'];
const TARGET_POPS = 10;

export default function SpacePrizeGame({ unitNumber, onComplete }: SpacePrizeGameProps) {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [phase, setPhase] = useState<'game' | 'prize'>('game');
  const [popEffects, setPopEffects] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  const prize = PRIZES[(unitNumber - 1) % PRIZES.length];

  // Spawn floating items
  useEffect(() => {
    if (phase !== 'game') return;

    const spawn = () => {
      setItems(prev => {
        const active = prev.filter(i => !i.popped);
        if (active.length >= 6) return prev;
        return [...prev, {
          id: Date.now() + Math.random(),
          emoji: GAME_EMOJIS[Math.floor(Math.random() * GAME_EMOJIS.length)],
          x: 10 + Math.random() * 80,
          y: 100 + Math.random() * 20,
          popped: false,
          size: 40 + Math.random() * 24,
          speed: 2 + Math.random() * 3,
        }];
      });
    };

    spawn();
    const interval = setInterval(spawn, 600);
    return () => clearInterval(interval);
  }, [phase]);

  // Animate items floating up
  useEffect(() => {
    if (phase !== 'game') return;
    const frame = setInterval(() => {
      setItems(prev => prev
        .map(i => i.popped ? i : { ...i, y: i.y - i.speed * 0.5 })
        .filter(i => i.y > -20 || i.popped)
      );
    }, 50);
    return () => clearInterval(frame);
  }, [phase]);

  const handlePop = useCallback((item: FloatingItem) => {
    if (item.popped) return;

    playPopSound(poppedCount / TARGET_POPS * 3);

    // Add pop effect
    setPopEffects(prev => [...prev, { id: item.id, x: item.x, y: item.y, emoji: item.emoji }]);
    setTimeout(() => setPopEffects(prev => prev.filter(e => e.id !== item.id)), 600);

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, popped: true } : i));

    const newCount = poppedCount + 1;
    setPoppedCount(newCount);

    if (newCount >= TARGET_POPS) {
      setTimeout(() => {
        setPhase('prize');
        playPrizeRevealSound();
      }, 500);
    }
  }, [poppedCount]);

  // Prize reveal
  if (phase === 'prize') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: 20, gap: 16,
      }}>
        {/* Confetti */}
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{
            position: 'fixed',
            left: `${Math.random() * 100}%`,
            top: -10,
            width: 10 + Math.random() * 8,
            height: 6 + Math.random() * 4,
            background: ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784', '#CE93D8'][i % 5],
            borderRadius: 2,
            animation: `confettiFall 2.5s ease-in ${Math.random() * 0.8}s forwards`,
            opacity: 0,
            ['--drift' as string]: `${(Math.random() - 0.5) * 80}px`,
          }} />
        ))}

        <div style={{
          animation: 'streakBounce 0.8s ease-out',
          filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))',
        }}>
          <span style={{ fontSize: 120 }}>{prize.emoji}</span>
        </div>

        <h2 style={{
          color: '#FFD700', fontFamily: "'Nunito', sans-serif",
          fontSize: 28, textAlign: 'center', margin: 0,
          animation: 'streakFadeIn 0.5s ease-out 0.3s both',
        }}>
          You earned a {prize.name}!
        </h2>

        <p style={{
          color: '#B0BEC5', fontSize: 16,
          fontFamily: "'Nunito', sans-serif",
          animation: 'streakFadeIn 0.5s ease-out 0.5s both',
        }}>
          Space prize {unitNumber} of 10
        </p>

        <button
          onClick={() => onComplete(prize.emoji)}
          style={{
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            border: 'none', borderRadius: 16, color: '#fff',
            padding: '16px 40px', cursor: 'pointer', fontSize: 20,
            fontWeight: 'bold', fontFamily: "'Nunito', sans-serif",
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
            animation: 'streakFadeIn 0.5s ease-out 0.7s both',
            marginTop: 8,
          }}
        >
          🏠 Back to Map
        </button>

        <style>{`
          @keyframes confettiFall {
            0% { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg); }
            100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); }
          }
          @keyframes streakBounce {
            0% { transform: scale(0) rotate(-20deg); }
            40% { transform: scale(1.3) rotate(5deg); }
            60% { transform: scale(0.9) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes streakFadeIn {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // Tapping game
  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      overflow: 'hidden', touchAction: 'manipulation',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 16px 0', position: 'relative', zIndex: 10,
      }}>
        <h2 style={{
          color: '#FFD700', fontFamily: "'Nunito', sans-serif",
          fontSize: 24, margin: '0 0 8px',
        }}>
          🎮 Tap the rockets!
        </h2>

        {/* Progress bar */}
        <div style={{
          width: 200, height: 16, borderRadius: 8,
          background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${(poppedCount / TARGET_POPS) * 100}%`,
            height: '100%', borderRadius: 8,
            background: 'linear-gradient(90deg, #FFD700, #FF8A00)',
            transition: 'width 0.3s',
          }} />
        </div>
        <span style={{ color: '#B0BEC5', fontSize: 14, marginTop: 4 }}>
          {poppedCount} / {TARGET_POPS}
        </span>
      </div>

      {/* Floating items */}
      {items.filter(i => !i.popped).map(item => (
        <button
          key={item.id}
          onClick={() => handlePop(item)}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.05s linear',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: `wobble ${1 + Math.random()}s ease-in-out infinite`,
          }}
        >
          {item.emoji}
        </button>
      ))}

      {/* Pop effects */}
      {popEffects.map(e => (
        <div key={e.id} style={{
          position: 'absolute',
          left: `${e.x}%`, top: `${e.y}%`,
          transform: 'translate(-50%, -50%)',
          animation: 'popBurst 0.5s ease-out forwards',
          fontSize: 40, pointerEvents: 'none',
        }}>
          💥
        </div>
      ))}

      <style>{`
        @keyframes wobble {
          0%, 100% { transform: translate(-50%, -50%) rotate(-5deg); }
          50% { transform: translate(-50%, -50%) rotate(5deg); }
        }
        @keyframes popBurst {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
