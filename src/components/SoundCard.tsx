import { useContext } from 'react';
import ProfileContext from './ProfileContext';
import type { SoundCard as SoundCardType } from '../types';

interface SoundCardProps {
  card: SoundCardType;
  size?: 'small' | 'large';
  onTap?: () => void;
  highlighted?: boolean;
  hasRecording?: boolean;
  onPlayRecording?: () => void;
  showFront?: boolean;
}

const typeColors: Record<string, string> = {
  consonant: '#4FC3F7',
  short_vowel: '#FF8A65',
  digraph: '#CE93D8',
  glued_sound: '#81C784',
  bonus_letter: '#FFD54F',
  suffix: '#F48FB1',
};

function getLowerGrapheme(grapheme: string): string {
  if (grapheme.length === 2 && grapheme[0] === grapheme[1].toUpperCase()) {
    return grapheme[1];
  }
  return grapheme.toLowerCase();
}

export default function SoundCard({
  card, size = 'large', onTap, highlighted,
  hasRecording, onPlayRecording, showFront = false,
}: SoundCardProps) {
  const profile = useContext(ProfileContext);
  const cardGradient = profile?.theme?.cardGradient || 'linear-gradient(135deg, #2a2a5e, #1a1a4e)';
  const handleClick = () => {
    onTap?.();
  };

  const isLarge = size === 'large';
  const bgColor = typeColors[card.type] || '#4FC3F7';

  return (
    <div style={{
      width: isLarge ? 200 : 120,
      height: isLarge ? 240 : 150,
    }}>
      <button
        onClick={handleClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: 20,
          border: highlighted ? '4px solid #FFD700' : '3px solid rgba(255,255,255,0.3)',
          background: showFront
            ? cardGradient
            : `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          boxShadow: highlighted
            ? '0 0 20px rgba(255, 215, 0, 0.6), 0 8px 24px rgba(0,0,0,0.3)'
            : '0 8px 24px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          padding: isLarge ? 16 : 10,
          transition: 'transform 0.15s, background 0.4s, box-shadow 0.15s',
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        {showFront ? (
          <span style={{
            fontSize: isLarge ? 64 : 36,
            fontWeight: 'bold',
            color: '#fff',
            lineHeight: 1.1,
          }}>
            {getLowerGrapheme(card.grapheme)}
          </span>
        ) : (
          <>
            <span style={{ fontSize: isLarge ? 48 : 32, marginBottom: 4 }}>
              {card.emoji}
            </span>
            <span style={{
              fontSize: isLarge ? 40 : 28,
              fontWeight: 'bold',
              color: '#1a1a2e',
              lineHeight: 1.1,
            }}>
              {card.grapheme}
            </span>
            <span style={{
              fontSize: isLarge ? 16 : 12,
              color: '#1a1a2e',
              opacity: 0.8,
              marginTop: 4,
            }}>
              {card.type === 'suffix' ? (
                <>
                  <span style={{ textDecoration: 'underline' }}>
                    {card.keyword.slice(0, -card.grapheme.replace('-', '').length)}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #1a1a2e', borderRadius: '50%',
                    width: isLarge ? 22 : 16, height: isLarge ? 22 : 16,
                    lineHeight: 1, fontWeight: 'bold',
                  }}>
                    {card.keyword.slice(-card.grapheme.replace('-', '').length)}
                  </span>
                </>
              ) : card.keyword}
            </span>
            <span style={{
              fontSize: isLarge ? 14 : 10,
              color: '#1a1a2e',
              opacity: 0.6,
              marginTop: 2,
            }}>
              {card.phoneme}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
