import { useEffect, useState, useContext } from 'react';
import ProfileContext from './ProfileContext';
import type { Rating } from '../types';

interface SpaceCelebrationProps {
  rating: Rating | null;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  delay: number;
}

export default function SpaceCelebration({ rating, onComplete }: SpaceCelebrationProps) {
  const profile = useContext(ProfileContext);
  const childName = profile?.childName || '';
  const theme = profile?.theme;
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!rating) return;

    setVisible(true);

    if (rating === 'green') {
      // Generate celebration particles
      const emojis = theme?.celebrationEmojis || ['⭐', '🌟', '✨', '💫', '🚀', '🌠', '🎆'];
      const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.random() * 30,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    }

    const timer = setTimeout(() => {
      setVisible(false);
      setParticles([]);
      onComplete();
    }, rating === 'green' ? 2500 : 1500);

    return () => clearTimeout(timer);
  }, [rating, onComplete]);

  if (!visible || !rating) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {rating === 'green' && (
        <>
          {/* Rocket launch */}
          <div style={{
            fontSize: 80,
            animation: 'rocketLaunch 2s ease-in forwards',
          }}>
            {theme?.goodRatingEmoji || '🚀'}
          </div>

          {/* Star particles */}
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: p.size,
                animation: `starBurst 1.5s ease-out ${p.delay}s forwards`,
                opacity: 0,
              }}
            >
              {p.emoji}
            </div>
          ))}

          {/* "GREAT JOB!" text */}
          <div style={{
            position: 'absolute',
            fontSize: 48,
            fontWeight: 'bold',
            color: theme?.accentColor || '#FFD700',
            textShadow: `0 0 20px ${theme?.accentColor || '#FFD700'}cc, 0 4px 8px rgba(0,0,0,0.5)`,
            fontFamily: "'Nunito', sans-serif",
            animation: 'popIn 0.5s ease-out 0.3s both',
          }}>
            GREAT JOB{childName ? `, ${childName}` : ''}! 🌟
          </div>
        </>
      )}

      {rating === 'yellow' && (
        <div style={{
          fontSize: 64,
          animation: 'orbitSpin 1.5s ease-in-out',
        }}>
          <div>{theme?.okRatingEmoji || '🪐'}</div>
          <div style={{
            fontSize: 28,
            color: '#FFC107',
            fontWeight: 'bold',
            fontFamily: "'Nunito', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            marginTop: 8,
            animation: 'popIn 0.4s ease-out 0.2s both',
          }}>
            Almost there!
          </div>
        </div>
      )}

      {rating === 'red' && (
        <div style={{
          fontSize: 48,
          animation: 'gentleBounce 1s ease-in-out',
        }}>
          <div style={{ fontSize: 56 }}>{theme?.tryAgainEmoji || '☄️'}</div>
          <div style={{
            fontSize: 24,
            color: '#EF9A9A',
            fontWeight: 'bold',
            fontFamily: "'Nunito', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            marginTop: 8,
          }}>
            We'll keep practicing!
          </div>
        </div>
      )}

      <style>{`
        @keyframes rocketLaunch {
          0% { transform: translateY(100px) scale(1); opacity: 1; }
          50% { transform: translateY(-50px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-400px) scale(0.5); opacity: 0; }
        }
        @keyframes starBurst {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8) translateY(-30px); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes orbitSpin {
          0% { transform: rotate(-10deg) scale(0.8); opacity: 0; }
          30% { transform: rotate(5deg) scale(1.1); opacity: 1; }
          60% { transform: rotate(-3deg) scale(1); opacity: 1; }
          100% { transform: rotate(0deg) scale(1); opacity: 0; }
        }
        @keyframes gentleBounce {
          0% { transform: translateY(-20px); opacity: 0; }
          40% { transform: translateY(10px); opacity: 1; }
          60% { transform: translateY(-5px); opacity: 1; }
          80% { transform: translateY(3px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
