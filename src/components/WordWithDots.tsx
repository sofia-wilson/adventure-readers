import type { Recorder } from '../hooks/useRecorder';

interface WordWithDotsProps {
  sounds: string[];
  dotColor?: string;
  recorder?: Recorder;
  fontSize?: number;
  suffix?: number; // number of trailing sounds that form the suffix
  onSoundTap?: (soundIndex: number) => void; // custom tap handler (overrides default)
}

export default function WordWithDots({
  sounds, dotColor = '#4CAF50', recorder, fontSize = 64, suffix, onSoundTap,
}: WordWithDotsProps) {
  const dotSize = Math.max(12, Math.round(fontSize / 5));
  const baseCount = suffix ? sounds.length - suffix : sounds.length;

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    }}>
      {/* Base word group — underlined */}
      <div style={{
        display: 'flex',
        position: 'relative',
      }}>
        {sounds.slice(0, baseCount).map((sound, i) => (
          <button
            key={i}
            onClick={() => onSoundTap ? onSoundTap(i) : recorder?.playRecording(sound)}
            disabled={!recorder && !onSoundTap}
            style={{
              background: 'none', border: 'none',
              cursor: recorder ? 'pointer' : 'default',
              padding: '6px 2px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 12,
            }}
            onMouseDown={e => { if (recorder) (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            <span style={{
              fontSize, fontWeight: 'bold', color: '#fff',
              fontFamily: "'Nunito', sans-serif", lineHeight: 1,
            }}>
              {sound.replace(/^-/, '')}
            </span>
            <span style={{
              width: dotSize, height: dotSize, borderRadius: '50%', background: dotColor,
            }} />
          </button>
        ))}

        {/* Underline spanning the base word */}
        {suffix && suffix > 0 && (
          <div style={{
            position: 'absolute',
            bottom: dotSize + 14,
            left: 8,
            right: 8,
            height: 3,
            background: '#4FC3F7',
            borderRadius: 2,
          }} />
        )}
      </div>

      {/* Suffix sounds — circled dots */}
      {suffix && suffix > 0 && sounds.slice(baseCount).map((sound, i) => (
        <button
          key={`suffix-${i}`}
          onClick={() => onSoundTap ? onSoundTap(baseCount + i) : recorder?.playRecording(sound)}
          disabled={!recorder && !onSoundTap}
          style={{
            background: 'none', border: 'none',
            cursor: recorder ? 'pointer' : 'default',
            padding: '6px 2px',
            paddingBottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 6,
          }}
          onMouseDown={e => { if (recorder) (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          <span style={{
            fontSize, fontWeight: 'bold', color: '#fff',
            fontFamily: "'Nunito', sans-serif", lineHeight: 1,
          }}>
            {sound.replace(/^-/, '')}
          </span>
          {/* Dot with circle around it */}
          <span style={{
            width: dotSize + 12,
            height: dotSize + 12,
            borderRadius: '50%',
            border: `2.5px solid #FF8A65`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              width: dotSize, height: dotSize, borderRadius: '50%', background: dotColor,
            }} />
          </span>
        </button>
      ))}
    </div>
  );
}
