import type { Unit, BlendingWord } from '../types';

export const units: Unit[] = [
  {
    id: 'K-U1',
    name: 'Unit 1',
    level: 'K',
    description: 'Letter Sounds',
    planetName: 'Mercury',
    planetColor: '#A0522D',
    activities: ['sound_drill'],
  },
  {
    id: 'K-U2',
    name: 'Unit 2',
    level: 'K',
    description: 'Blending CVC Words',
    planetName: 'Venus',
    planetColor: '#DEB887',
    activities: ['blending', 'phonetic_hfw', 'trick_word', 'unit_sentences'],
  },
  {
    id: 'K-U3',
    name: 'Unit 3',
    level: 'K',
    description: 'Digraphs',
    planetName: 'Earth',
    planetColor: '#4169E1',
    activities: ['sound_drill', 'blending', 'trick_word', 'unit_sentences'],
  },
  {
    id: 'K-U4',
    name: 'Unit 4',
    level: 'K',
    description: 'Bonus Letters & Glued Sound: all',
    planetName: 'Mars',
    planetColor: '#CD5C5C',
    activities: ['sound_drill', 'blending', 'trick_word', 'unit_sentences'],
  },
  {
    id: 'K-U5',
    name: 'Unit 5',
    level: 'K',
    description: 'Glued Sounds: am, an',
    planetName: 'Jupiter',
    planetColor: '#DAA520',
    activities: ['sound_drill', 'blending', 'trick_word', 'unit_sentences'],
  },
  {
    id: 'K-U6',
    name: 'Unit 6',
    level: 'K',
    description: 'Suffix -s',
    planetName: 'Saturn',
    planetColor: '#F4A460',
    activities: ['sound_drill', 'blending', 'trick_word', 'unit_sentences'],
  },
  {
    id: 'K-U7',
    name: 'Unit 7',
    level: 'K',
    description: 'Glued Sounds: ng & nk',
    planetName: 'Uranus',
    planetColor: '#87CEEB',
    activities: ['sound_drill', 'blending', 'trick_word', 'unit_sentences'],
  },
  {
    id: 'K-U8',
    name: 'Unit 8',
    level: 'K',
    description: 'Blending Review',
    planetName: 'Neptune',
    planetColor: '#4682B4',
    activities: ['blending_review'],
  },
  {
    id: 'K-U9',
    name: 'Unit 9',
    level: 'K',
    description: 'Trick Word Snap',
    planetName: 'Pluto',
    planetColor: '#BC8F8F',
    activities: ['trick_review'],
  },
  {
    id: 'K-U10',
    name: 'Unit 10',
    level: 'K',
    description: 'Read Sentences',
    planetName: 'Galaxy',
    planetColor: '#9C27B0',
    activities: ['sentences'],
  },
];

export const blendingWords: BlendingWord[] = [
  // === K-U2: Blending — VC then CVC, grouped by vowel/rime ===
  // Start with VC (2 sounds)
  { word: 'at', sounds: ['a', 't'], unit: 'K-U2' },
  // CVC with -at rime
  { word: 'mat', sounds: ['m', 'a', 't'], unit: 'K-U2' },
  { word: 'sat', sounds: ['s', 'a', 't'], unit: 'K-U2' },
  { word: 'rat', sounds: ['r', 'a', 't'], unit: 'K-U2' },
  // Switch ending: -ap
  { word: 'map', sounds: ['m', 'a', 'p'], unit: 'K-U2' },
  { word: 'cap', sounds: ['c', 'a', 'p'], unit: 'K-U2' },
  { word: 'lap', sounds: ['l', 'a', 'p'], unit: 'K-U2' },
  // Switch vowel: short i
  { word: 'sit', sounds: ['s', 'i', 't'], unit: 'K-U2' },
  { word: 'rip', sounds: ['r', 'i', 'p'], unit: 'K-U2' },
  { word: 'lit', sounds: ['l', 'i', 't'], unit: 'K-U2' },
  { word: 'fin', sounds: ['f', 'i', 'n'], unit: 'K-U2' },
  // Short o
  { word: 'hot', sounds: ['h', 'o', 't'], unit: 'K-U2' },
  { word: 'log', sounds: ['l', 'o', 'g'], unit: 'K-U2' },
  { word: 'job', sounds: ['j', 'o', 'b'], unit: 'K-U2' },
  // Short u
  { word: 'fun', sounds: ['f', 'u', 'n'], unit: 'K-U2' },
  { word: 'rug', sounds: ['r', 'u', 'g'], unit: 'K-U2' },
  { word: 'sun', sounds: ['s', 'u', 'n'], unit: 'K-U2' },
  // Short e
  { word: 'leg', sounds: ['l', 'e', 'g'], unit: 'K-U2' },
  { word: 'red', sounds: ['r', 'e', 'd'], unit: 'K-U2' },

  // === K-U3: CVC + digraph words ===
  { word: 'wish', sounds: ['w', 'i', 'sh'], unit: 'K-U3' },
  { word: 'chop', sounds: ['ch', 'o', 'p'], unit: 'K-U3' },
  { word: 'sock', sounds: ['s', 'o', 'ck'], unit: 'K-U3' },
  { word: 'shop', sounds: ['sh', 'o', 'p'], unit: 'K-U3' },
  { word: 'when', sounds: ['wh', 'e', 'n'], unit: 'K-U3' },
  { word: 'this', sounds: ['th', 'i', 's'], unit: 'K-U3' },
  { word: 'such', sounds: ['s', 'u', 'ch'], unit: 'K-U3' },
  { word: 'back', sounds: ['b', 'a', 'ck'], unit: 'K-U3' },

  // === K-U4: Bonus letter + glued sound words ===
  { word: 'hill', sounds: ['h', 'i', 'll'], unit: 'K-U4' },
  { word: 'puff', sounds: ['p', 'u', 'ff'], unit: 'K-U4' },
  { word: 'bill', sounds: ['b', 'i', 'll'], unit: 'K-U4' },
  { word: 'miss', sounds: ['m', 'i', 'ss'], unit: 'K-U4' },
  { word: 'call', sounds: ['c', 'all'], unit: 'K-U4' },
  { word: 'ball', sounds: ['b', 'all'], unit: 'K-U4' },
  { word: 'tall', sounds: ['t', 'all'], unit: 'K-U4' },
  { word: 'fall', sounds: ['f', 'all'], unit: 'K-U4' },

  // === K-U5: Glued sounds am, an ===
  { word: 'ham', sounds: ['h', 'am'], unit: 'K-U5' },
  { word: 'can', sounds: ['c', 'an'], unit: 'K-U5' },
  { word: 'fan', sounds: ['f', 'an'], unit: 'K-U5' },
  { word: 'man', sounds: ['m', 'an'], unit: 'K-U5' },
  { word: 'ran', sounds: ['r', 'an'], unit: 'K-U5' },
  { word: 'than', sounds: ['th', 'an'], unit: 'K-U5' },
  { word: 'jam', sounds: ['j', 'am'], unit: 'K-U5' },
  { word: 'dam', sounds: ['d', 'am'], unit: 'K-U5' },

  // === K-U6: Base words + suffix -s ===
  { word: 'sits', sounds: ['s', 'i', 't', '-s'], unit: 'K-U6', suffix: 1 },
  { word: 'dogs', sounds: ['d', 'o', 'g', '-s'], unit: 'K-U6', suffix: 1 },
  { word: 'ships', sounds: ['sh', 'i', 'p', '-s'], unit: 'K-U6', suffix: 1 },
  { word: 'maps', sounds: ['m', 'a', 'p', '-s'], unit: 'K-U6', suffix: 1 },
  { word: 'rocks', sounds: ['r', 'o', 'ck', '-s'], unit: 'K-U6', suffix: 1 },
  { word: 'fills', sounds: ['f', 'i', 'll', '-s'], unit: 'K-U6', suffix: 1 },

  // === K-U7: Glued sounds ng/nk ===
  { word: 'bang', sounds: ['b', 'ang'], unit: 'K-U7' },
  { word: 'bank', sounds: ['b', 'ank'], unit: 'K-U7' },
  { word: 'pink', sounds: ['p', 'ink'], unit: 'K-U7' },
  { word: 'sing', sounds: ['s', 'ing'], unit: 'K-U7' },
  { word: 'long', sounds: ['l', 'ong'], unit: 'K-U7' },
  { word: 'song', sounds: ['s', 'ong'], unit: 'K-U7' },
  { word: 'ring', sounds: ['r', 'ing'], unit: 'K-U7' },
  { word: 'think', sounds: ['th', 'ink'], unit: 'K-U7' },
  { word: 'chunk', sounds: ['ch', 'unk'], unit: 'K-U7' },
  { word: 'sunk', sounds: ['s', 'unk'], unit: 'K-U7' },

];

// === Sentences for Unit 10 ===
export interface SentenceWord {
  text: string;          // display text (may include punctuation)
  type: 'trick' | 'phonetic' | 'suffix';
  sounds?: string[];     // phonetic breakdown for phonetic/suffix words
  suffix?: number;       // number of suffix sounds (for suffix words)
}

export interface Sentence {
  words: SentenceWord[];
  emoji: string;
  unit?: string; // which unit this sentence belongs to (K-U2 through K-U10)
}

export const sentences: Sentence[] = [
  // === K-U2: CVC Sentences (no glued sounds — only true CVC words) ===
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'cat', type: 'phonetic', sounds: ['c', 'a', 't'] },
      { text: 'sat.', type: 'phonetic', sounds: ['s', 'a', 't'] },
    ],
    emoji: '🐱', unit: 'K-U2',
  },
  {
    words: [
      { text: 'A', type: 'trick' },
      { text: 'big', type: 'phonetic', sounds: ['b', 'i', 'g'] },
      { text: 'red', type: 'phonetic', sounds: ['r', 'e', 'd'] },
      { text: 'bus.', type: 'phonetic', sounds: ['b', 'u', 's'] },
    ],
    emoji: '🚌', unit: 'K-U2',
  },
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'pig', type: 'phonetic', sounds: ['p', 'i', 'g'] },
      { text: 'is', type: 'trick' },
      { text: 'wet.', type: 'phonetic', sounds: ['w', 'e', 't'] },
    ],
    emoji: '🐷', unit: 'K-U2',
  },

  // === K-U3: Digraph Sentences ===
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'ship', type: 'phonetic', sounds: ['sh', 'i', 'p'] },
      { text: 'is', type: 'trick' },
      { text: 'big.', type: 'phonetic', sounds: ['b', 'i', 'g'] },
    ],
    emoji: '🚢', unit: 'K-U3',
  },
  {
    words: [
      { text: 'A', type: 'trick' },
      { text: 'fish', type: 'phonetic', sounds: ['f', 'i', 'sh'] },
      { text: 'and', type: 'trick' },
      { text: 'a', type: 'trick' },
      { text: 'chip.', type: 'phonetic', sounds: ['ch', 'i', 'p'] },
    ],
    emoji: '🐟', unit: 'K-U3',
  },
  {
    words: [
      { text: 'He', type: 'trick' },
      { text: 'has', type: 'phonetic', sounds: ['h', 'a', 's'] },
      { text: 'a', type: 'trick' },
      { text: 'thin', type: 'phonetic', sounds: ['th', 'i', 'n'] },
      { text: 'wig.', type: 'phonetic', sounds: ['w', 'i', 'g'] },
    ],
    emoji: '🎩', unit: 'K-U3',
  },

  // === K-U4: Bonus Letter Sentences ===
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'bell', type: 'phonetic', sounds: ['b', 'e', 'll'] },
      { text: 'fell.', type: 'phonetic', sounds: ['f', 'e', 'll'] },
    ],
    emoji: '🔔', unit: 'K-U4',
  },
  {
    words: [
      { text: 'I', type: 'trick' },
      { text: 'will', type: 'phonetic', sounds: ['w', 'i', 'll'] },
      { text: 'huff', type: 'phonetic', sounds: ['h', 'u', 'ff'] },
      { text: 'and', type: 'trick' },
      { text: 'puff.', type: 'phonetic', sounds: ['p', 'u', 'ff'] },
    ],
    emoji: '💨', unit: 'K-U4',
  },
  {
    words: [
      { text: 'He', type: 'trick' },
      { text: 'is', type: 'trick' },
      { text: 'off', type: 'phonetic', sounds: ['o', 'ff'] },
      { text: 'the', type: 'trick' },
      { text: 'hill.', type: 'phonetic', sounds: ['h', 'i', 'll'] },
    ],
    emoji: '⛰️', unit: 'K-U4',
  },

  // === K-U5: Glued Sound Sentences ===
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'man', type: 'phonetic', sounds: ['m', 'an'] },
      { text: 'ran.', type: 'phonetic', sounds: ['r', 'an'] },
    ],
    emoji: '🏃', unit: 'K-U5',
  },
  {
    words: [
      { text: 'A', type: 'trick' },
      { text: 'fan', type: 'phonetic', sounds: ['f', 'an'] },
      { text: 'and', type: 'trick' },
      { text: 'a', type: 'trick' },
      { text: 'van.', type: 'phonetic', sounds: ['v', 'an'] },
    ],
    emoji: '🚐', unit: 'K-U5',
  },
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'jam', type: 'phonetic', sounds: ['j', 'am'] },
      { text: 'is', type: 'trick' },
      { text: 'on', type: 'phonetic', sounds: ['o', 'n'] },
      { text: 'the', type: 'trick' },
      { text: 'ham.', type: 'phonetic', sounds: ['h', 'am'] },
    ],
    emoji: '🍓', unit: 'K-U5',
  },

  // === K-U6: Suffix -s Sentences ===
  {
    words: [
      { text: 'His', type: 'trick' },
      { text: 'dog', type: 'phonetic', sounds: ['d', 'o', 'g'] },
      { text: 'sits.', type: 'suffix', sounds: ['s', 'i', 't', '-s'], suffix: 1 },
    ],
    emoji: '🐕', unit: 'K-U6',
  },
  {
    words: [
      { text: 'She', type: 'trick' },
      { text: 'maps', type: 'suffix', sounds: ['m', 'a', 'p', '-s'], suffix: 1 },
      { text: 'the', type: 'trick' },
      { text: 'path.', type: 'phonetic', sounds: ['p', 'a', 'th'] },
    ],
    emoji: '🗺️', unit: 'K-U6',
  },
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'dog', type: 'phonetic', sounds: ['d', 'o', 'g'] },
      { text: 'digs.', type: 'suffix', sounds: ['d', 'i', 'g', '-s'], suffix: 1 },
    ],
    emoji: '🦴', unit: 'K-U6',
  },

  // === K-U7: ng & nk Sentences ===
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'king', type: 'phonetic', sounds: ['k', 'ing'] },
      { text: 'can', type: 'phonetic', sounds: ['c', 'an'] },
      { text: 'sing.', type: 'phonetic', sounds: ['s', 'ing'] },
    ],
    emoji: '👑', unit: 'K-U7',
  },
  {
    words: [
      { text: 'A', type: 'trick' },
      { text: 'pink', type: 'phonetic', sounds: ['p', 'ink'] },
      { text: 'ring.', type: 'phonetic', sounds: ['r', 'ing'] },
    ],
    emoji: '💍', unit: 'K-U7',
  },
  {
    words: [
      { text: 'I', type: 'trick' },
      { text: 'think', type: 'phonetic', sounds: ['th', 'ink'] },
      { text: 'it', type: 'phonetic', sounds: ['i', 't'] },
      { text: 'sunk.', type: 'phonetic', sounds: ['s', 'unk'] },
    ],
    emoji: '🚢', unit: 'K-U7',
  },

  // === K-U10: Review Sentences (mix all skills) ===
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'dog', type: 'phonetic', sounds: ['d', 'o', 'g'] },
      { text: 'sat.', type: 'phonetic', sounds: ['s', 'a', 't'] },
    ],
    emoji: '🐶', unit: 'K-U10',
  },
  {
    words: [
      { text: 'I', type: 'trick' },
      { text: 'can', type: 'phonetic', sounds: ['c', 'an'] },
      { text: 'run', type: 'phonetic', sounds: ['r', 'u', 'n'] },
      { text: 'fast!', type: 'phonetic', sounds: ['f', 'a', 's', 't'] },
    ],
    emoji: '🏃', unit: 'K-U10',
  },
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'king', type: 'phonetic', sounds: ['k', 'ing'] },
      { text: 'sang', type: 'phonetic', sounds: ['s', 'ang'] },
      { text: 'a', type: 'trick' },
      { text: 'song.', type: 'phonetic', sounds: ['s', 'ong'] },
    ],
    emoji: '👑', unit: 'K-U10',
  },
  {
    words: [
      { text: 'His', type: 'trick' },
      { text: 'ship', type: 'phonetic', sounds: ['sh', 'i', 'p'] },
      { text: 'sinks.', type: 'suffix', sounds: ['s', 'ink', '-s'], suffix: 1 },
    ],
    emoji: '🚢', unit: 'K-U10',
  },
  {
    words: [
      { text: 'The', type: 'trick' },
      { text: 'bell', type: 'phonetic', sounds: ['b', 'e', 'll'] },
      { text: 'rings.', type: 'suffix', sounds: ['r', 'ing', '-s'], suffix: 1 },
    ],
    emoji: '🔔', unit: 'K-U10',
  },
];

// Get unique words from sentences that need recordings
// Get sentences for a specific unit
export function getSentencesForUnit(unitId: string): Sentence[] {
  return sentences.filter(s => s.unit === unitId);
}

// Get ALL unique words from sentences (for full recording coverage)
export function getSentenceWords(): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const sentence of sentences) {
    for (const w of sentence.words) {
      const clean = w.text.replace(/[.,!?]/g, '').toLowerCase();
      if (!seen.has(clean)) {
        seen.add(clean);
        words.push(clean);
      }
    }
  }
  return words;
}

// Get only phonetic/suffix sentence words (not trick words — those are in HFW section)
export function getPhoneticSentenceWords(): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const sentence of sentences) {
    for (const w of sentence.words) {
      if (w.type === 'trick') continue;
      const clean = w.text.replace(/[.,!?]/g, '').toLowerCase();
      if (!seen.has(clean)) {
        seen.add(clean);
        words.push(clean);
      }
    }
  }
  return words;
}

export function getBlendingWordsForUnit(unitId: string): BlendingWord[] {
  return blendingWords.filter(w => w.unit === unitId);
}

// Get ALL blending words from units 2-7 for review
export function getAllBlendingWords(): BlendingWord[] {
  return blendingWords.filter(w =>
    w.unit.startsWith('K-U') && parseInt(w.unit.replace('K-U', '')) >= 2
  );
}

export function getUnitById(unitId: string): Unit | undefined {
  return units.find(u => u.id === unitId);
}
