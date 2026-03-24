import { useContext } from 'react';
import ProfileContext from './ProfileContext';
import { getTheme } from '../data/themes';

interface WordExample {
  word: string;
  highlight: string; // The part to highlight (e.g., 'sh', 'ff', 'am')
}

interface ConceptIntroData {
  title: string;
  emoji: string;
  words: WordExample[];
  script: string;
}

const CONCEPTS: Record<string, ConceptIntroData> = {
  'K-U3': {
    title: 'Digraphs',
    emoji: '🔤',
    words: [
      { word: 'ship', highlight: 'sh' },
      { word: 'chip', highlight: 'ch' },
      { word: 'thin', highlight: 'th' },
      { word: 'whip', highlight: 'wh' },
      { word: 'duck', highlight: 'ck' },
    ],
    script: 'Sometimes two letters work together to make one sound. We call these digraphs. Look — "sh" makes one sound, not two! Let\'s practice these special sounds.',
  },
  'K-U4': {
    title: 'Bonus Letters',
    emoji: '✨',
    words: [
      { word: 'puff', highlight: 'ff' },
      { word: 'hill', highlight: 'll' },
      { word: 'miss', highlight: 'ss' },
      { word: 'fizz', highlight: 'zz' },
    ],
    script: 'When a one-syllable word ends with the letters f, l, s, and sometimes z, we add a bonus letter! Look — "puff" has two f\'s, but they make just one sound — /ff/. Let\'s practice these!',
  },
  'K-U5': {
    title: 'Glued Sounds',
    emoji: '🧲',
    words: [
      { word: 'ham', highlight: 'am' },
      { word: 'fan', highlight: 'an' },
      { word: 'jam', highlight: 'am' },
      { word: 'can', highlight: 'an' },
    ],
    script: 'Some sounds like to stick together — we call them glued sounds because they make one sound. In "ham," the "am" stays together as one sound. Listen: /h/ - /am/. Let\'s practice these sticky sounds!',
  },
  'K-U6': {
    title: 'Suffix -s',
    emoji: '➕',
    words: [
      { word: 'sits', highlight: 's' },
      { word: 'maps', highlight: 's' },
      { word: 'dogs', highlight: 's' },
    ],
    script: 'When we add the letter "s" to the end of a word, it changes the meaning — "sit" becomes "sits" or "dog" becomes "dogs." With these, it\'s best to read the base word together, then add the /s/ sound at the end. Let\'s practice!',
  },
  'K-U7': {
    title: 'Glued Sounds — ng & nk',
    emoji: '🧲',
    words: [
      { word: 'king', highlight: 'ing' },
      { word: 'sink', highlight: 'ink' },
      { word: 'song', highlight: 'ong' },
      { word: 'think', highlight: 'ink' },
    ],
    script: 'Here are two more glued sounds — "ing" like in "king" and "ink" like in "sink." These letters stick together just like "am" and "an." Let\'s practice!',
  },
};

interface ConceptIntroProps {
  unitId: string;
  onReady: () => void;
}

function HighlightedWord({ word, highlight, accentColor }: WordExample & { accentColor: string }) {
  // For suffix -s, highlight the last character and show base word differently
  if (highlight === 's' && word.endsWith('s')) {
    const base = word.slice(0, -1);
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 16, padding: '12px 20px',
        margin: 4,
      }}>
        <span style={{
          fontSize: 32, fontWeight: 'bold', color: '#fff',
          fontFamily: "'Nunito', sans-serif",
          textDecoration: 'underline',
          textDecorationColor: '#78909C',
          textUnderlineOffset: '6px',
        }}>
          {base}
        </span>
        <span style={{
          fontSize: 32, fontWeight: 'bold',
          color: accentColor,
          fontFamily: "'Nunito', sans-serif",
          border: `2px solid ${accentColor}`,
          borderRadius: '50%',
          width: 44, height: 44,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: 2,
        }}>
          s
        </span>
      </div>
    );
  }

  const idx = word.indexOf(highlight);
  if (idx === -1) return <span>{word}</span>;

  const before = word.slice(0, idx);
  const after = word.slice(idx + highlight.length);

  return (
    <div style={{
      display: 'inline-block',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 16, padding: '12px 20px',
      margin: 4,
    }}>
      <span style={{
        fontSize: 32, fontWeight: 'bold', color: '#fff',
        fontFamily: "'Nunito', sans-serif",
      }}>
        {before}
      </span>
      <span style={{
        fontSize: 32, fontWeight: 'bold',
        color: accentColor,
        fontFamily: "'Nunito', sans-serif",
        textDecoration: 'underline',
        textDecorationColor: accentColor,
        textUnderlineOffset: '6px',
        textDecorationThickness: '3px',
      }}>
        {highlight}
      </span>
      <span style={{
        fontSize: 32, fontWeight: 'bold', color: '#fff',
        fontFamily: "'Nunito', sans-serif",
      }}>
        {after}
      </span>
    </div>
  );
}

export default function ConceptIntro({ unitId, onReady }: ConceptIntroProps) {
  const profile = useContext(ProfileContext);
  const theme = getTheme(profile?.theme as any);
  const concept = CONCEPTS[unitId];
  const accentColor = theme?.accentColor || '#FFD700';

  if (!concept) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: 24,
      gap: 24,
    }}>
      {/* Title */}
      <h2 style={{
        color: accentColor,
        fontFamily: "'Nunito', sans-serif",
        fontSize: 28, margin: 0,
      }}>
        {concept.emoji} {concept.title}
      </h2>

      {/* Word examples */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', gap: 12,
        maxWidth: 400,
      }}>
        {concept.words.map((w, i) => (
          <HighlightedWord key={i} {...w} accentColor={accentColor} />
        ))}
      </div>

      {/* Parent script */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 16, padding: '16px 20px',
        maxWidth: 400,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <p style={{
          color: '#78909C', fontSize: 11, fontWeight: 'bold',
          fontFamily: "'Nunito', sans-serif",
          margin: '0 0 6px', textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          💡 Say to the reader:
        </p>
        <p style={{
          color: '#CFD8DC', fontSize: 15, lineHeight: 1.6,
          fontFamily: "'Nunito', sans-serif",
          margin: 0, fontStyle: 'italic',
        }}>
          "{concept.script}"
        </p>
      </div>

      {/* Ready button */}
      <button
        onClick={onReady}
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          border: 'none', borderRadius: 16,
          color: '#1a1a2e', padding: '16px 40px',
          cursor: 'pointer', fontSize: 20, fontWeight: 'bold',
          fontFamily: "'Nunito', sans-serif",
          boxShadow: `0 4px 20px ${accentColor}44`,
          marginTop: 8,
        }}
      >
        Ready for Practice! →
      </button>
    </div>
  );
}

export function hasConceptIntro(unitId: string): boolean {
  return unitId in CONCEPTS;
}
