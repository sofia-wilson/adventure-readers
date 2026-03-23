import { useEffect, useState, useContext } from 'react';
import ProfileContext from './ProfileContext';

interface GrandFinaleProps {
  prizes: string[];
  onDone: () => void;
}

function playFinaleSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Epic ascending fanfare
    const melody = [523, 587, 659, 784, 880, 988, 1047, 1175, 1319, 1568];
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 6 ? 'square' : 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.35);
    });

    // Big shimmer
    for (let i = 0; i < 15; i++) {
      const s = ctx.createOscillator();
      const g = ctx.createGain();
      s.type = 'sine';
      s.frequency.value = 1500 + Math.random() * 4000;
      const t = 1.2 + i * 0.08;
      g.gain.setValueAtTime(0.05, now + t);
      g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.2);
      s.connect(g);
      g.connect(ctx.destination);
      s.start(now + t);
      s.stop(now + t + 0.25);
    }
  } catch { /* */ }
}

export default function GrandFinale({ prizes, onDone }: GrandFinaleProps) {
  const profile = useContext(ProfileContext);
  const childName = profile?.childName || '';
  const [revealedCount, setRevealedCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    playFinaleSound();

    // Reveal prizes one by one
    const interval = setInterval(() => {
      setRevealedCount(prev => {
        if (prev >= prizes.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    const msgTimer = setTimeout(() => setShowMessage(true), prizes.length * 300 + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(msgTimer);
    };
  }, [prizes.length]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 50%, #0a0a2e 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Tons of confetti */}
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: -20,
          width: 10 + Math.random() * 12,
          height: 6 + Math.random() * 6,
          background: ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784', '#CE93D8', '#FF8A65'][i % 6],
          borderRadius: 2,
          animation: `confettiFall ${2 + Math.random() * 2}s ease-in ${Math.random() * 2}s infinite`,
          opacity: 0.8,
          ['--drift' as string]: `${(Math.random() - 0.5) * 100}px`,
        }} />
      ))}

      <h1 style={{
        color: '#FFD700', fontFamily: "'Nunito', sans-serif",
        fontSize: 36, textAlign: 'center', margin: '0 0 8px',
        textShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
        animation: 'streakBounce 0.8s ease-out',
      }}>
        🏆 SUPER READER{childName ? `, ${childName}` : ''}! 🏆
      </h1>

      <p style={{
        color: '#B0BEC5', fontSize: 18,
        fontFamily: "'Nunito', sans-serif",
        marginBottom: 24,
      }}>
        You collected all 10 space prizes!
      </p>

      {/* Prize grid — reveal one by one */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', gap: 16,
        maxWidth: 400, marginBottom: 32,
      }}>
        {prizes.map((prize, i) => (
          <div key={i} style={{
            width: 64, height: 64,
            borderRadius: 16,
            background: i < revealedCount
              ? 'rgba(255, 215, 0, 0.2)'
              : 'rgba(255,255,255,0.05)',
            border: i < revealedCount
              ? '3px solid #FFD700'
              : '3px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            transform: i < revealedCount ? 'scale(1)' : 'scale(0.5)',
            opacity: i < revealedCount ? 1 : 0.2,
            transition: 'all 0.3s ease-out',
            boxShadow: i < revealedCount
              ? '0 0 20px rgba(255, 215, 0, 0.3)'
              : 'none',
          }}>
            {prize}
          </div>
        ))}
      </div>

      {showMessage && (
        <>
          <p style={{
            color: '#fff', fontSize: 24,
            fontFamily: "'Nunito', sans-serif",
            textAlign: 'center',
            animation: 'streakFadeIn 0.5s ease-out both',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
          }}>
            {childName ? `${childName}, you` : 'You'} are an amazing reader!
          </p>

          <button
            onClick={onDone}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA000)',
              border: 'none', borderRadius: 16, color: '#1a1a2e',
              padding: '16px 40px', cursor: 'pointer', fontSize: 20,
              fontWeight: 'bold', fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
              marginTop: 16,
              animation: 'streakFadeIn 0.5s ease-out 0.3s both',
            }}
          >
            🌟 Celebrate! 🌟
          </button>
        </>
      )}

      <style>{`
        @keyframes confettiFall {
          0% { opacity: 0.8; transform: translateY(0) translateX(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); }
        }
        @keyframes streakBounce {
          0% { transform: scale(0) rotate(-10deg); }
          50% { transform: scale(1.2) rotate(3deg); }
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
