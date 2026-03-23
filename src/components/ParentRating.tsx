import { useContext } from 'react';
import ProfileContext from './ProfileContext';
import type { Rating } from '../types';

interface ParentRatingProps {
  onRate: (rating: Rating) => void;
}

export default function ParentRating({ onRate }: ParentRatingProps) {
  const profile = useContext(ProfileContext);
  const gotItEmoji = profile?.theme?.goodRatingEmoji || '🚀';
  return (
    <div style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
    }}>
      {/* Not quite — left */}
      <button
        onClick={() => onRate('red')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '12px 24px',
          borderRadius: 14,
          border: '2px solid #EF5350',
          background: 'rgba(239, 83, 80, 0.12)',
          cursor: 'pointer',
          transition: 'transform 0.1s',
          fontSize: 15,
          fontWeight: 'bold',
          color: '#EF5350',
          fontFamily: "'Nunito', sans-serif",
        }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.93)'; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        Not quite
      </button>

      {/* Got it — right */}
      <button
        onClick={() => onRate('green')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '12px 24px',
          borderRadius: 14,
          border: '2px solid #4CAF50',
          background: 'rgba(76, 175, 80, 0.12)',
          cursor: 'pointer',
          transition: 'transform 0.1s',
          fontSize: 15,
          fontWeight: 'bold',
          color: '#4CAF50',
          fontFamily: "'Nunito', sans-serif",
        }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.93)'; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        Got it! {gotItEmoji}
      </button>
    </div>
  );
}
