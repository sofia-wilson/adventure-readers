import type { SoundCard } from '../types';

export const soundCards: SoundCard[] = [
  // === K-U1: Consonants ===
  { id: 'b', grapheme: 'Bb', phoneme: '/b/', keyword: 'bat', speechText: 'b', type: 'consonant', unit: 'K-U1', emoji: '🦇' },
  { id: 'c', grapheme: 'Cc', phoneme: '/k/', keyword: 'cat', speechText: 'k', type: 'consonant', unit: 'K-U1', emoji: '🐱' },
  { id: 'd', grapheme: 'Dd', phoneme: '/d/', keyword: 'dog', speechText: 'd', type: 'consonant', unit: 'K-U1', emoji: '🐶' },
  { id: 'f', grapheme: 'Ff', phoneme: '/f/', keyword: 'fun', speechText: 'f', type: 'consonant', unit: 'K-U1', emoji: '🎉' },
  { id: 'g', grapheme: 'Gg', phoneme: '/g/', keyword: 'game', speechText: 'g', type: 'consonant', unit: 'K-U1', emoji: '🎮' },
  { id: 'h', grapheme: 'Hh', phoneme: '/h/', keyword: 'hat', speechText: 'h', type: 'consonant', unit: 'K-U1', emoji: '🎩' },
  { id: 'j', grapheme: 'Jj', phoneme: '/dʒ/', keyword: 'jug', speechText: 'j', type: 'consonant', unit: 'K-U1', emoji: '🫗' },
  { id: 'k', grapheme: 'Kk', phoneme: '/k/', keyword: 'kite', speechText: 'k', type: 'consonant', unit: 'K-U1', emoji: '🪁' },
  { id: 'l', grapheme: 'Ll', phoneme: '/l/', keyword: 'lamp', speechText: 'l', type: 'consonant', unit: 'K-U1', emoji: '💡' },
  { id: 'm', grapheme: 'Mm', phoneme: '/m/', keyword: 'man', speechText: 'm', type: 'consonant', unit: 'K-U1', emoji: '👨🏽' },
  { id: 'n', grapheme: 'Nn', phoneme: '/n/', keyword: 'nut', speechText: 'n', type: 'consonant', unit: 'K-U1', emoji: '🥜' },
  { id: 'p', grapheme: 'Pp', phoneme: '/p/', keyword: 'pan', speechText: 'p', type: 'consonant', unit: 'K-U1', emoji: '🍳' },
  { id: 'qu', grapheme: 'Qq', phoneme: '/kw/', keyword: 'queen', speechText: 'kw', type: 'consonant', unit: 'K-U1', emoji: '👸' },
  { id: 'r', grapheme: 'Rr', phoneme: '/r/', keyword: 'rat', speechText: 'r', type: 'consonant', unit: 'K-U1', emoji: '🐀' },
  { id: 's', grapheme: 'Ss', phoneme: '/s/', keyword: 'snake', speechText: 's', type: 'consonant', unit: 'K-U1', emoji: '🐍' },
  { id: 't', grapheme: 'Tt', phoneme: '/t/', keyword: 'top', speechText: 't', type: 'consonant', unit: 'K-U1', emoji: '🔝' },
  { id: 'v', grapheme: 'Vv', phoneme: '/v/', keyword: 'van', speechText: 'v', type: 'consonant', unit: 'K-U1', emoji: '🚐' },
  { id: 'w', grapheme: 'Ww', phoneme: '/w/', keyword: 'wind', speechText: 'w', type: 'consonant', unit: 'K-U1', emoji: '💨' },
  { id: 'x', grapheme: 'Xx', phoneme: '/ks/', keyword: 'fox', speechText: 'ks', type: 'consonant', unit: 'K-U1', emoji: '🦊' },
  { id: 'y', grapheme: 'Yy', phoneme: '/j/', keyword: 'yellow', speechText: 'y', type: 'consonant', unit: 'K-U1', emoji: '💛' },
  { id: 'z', grapheme: 'Zz', phoneme: '/z/', keyword: 'zebra', speechText: 'z', type: 'consonant', unit: 'K-U1', emoji: '🦓' },

  // === K-U1: Short Vowels ===
  { id: 'a', grapheme: 'Aa', phoneme: '/æ/', keyword: 'apple', speechText: 'ah', type: 'short_vowel', unit: 'K-U1', emoji: '🍎' },
  { id: 'e', grapheme: 'Ee', phoneme: '/ɛ/', keyword: 'Ed', speechText: 'eh', type: 'short_vowel', unit: 'K-U1', emoji: '🏃' },
  { id: 'i', grapheme: 'Ii', phoneme: '/ɪ/', keyword: 'itch', speechText: 'ih', type: 'short_vowel', unit: 'K-U1', emoji: '🐒' },
  { id: 'o', grapheme: 'Oo', phoneme: '/ɒ/', keyword: 'octopus', speechText: 'ah', type: 'short_vowel', unit: 'K-U1', emoji: '🐙' },
  { id: 'u', grapheme: 'Uu', phoneme: '/ʌ/', keyword: 'up', speechText: 'uh', type: 'short_vowel', unit: 'K-U1', emoji: '⬆️' },

  // === K-U3: Digraphs ===
  { id: 'wh', grapheme: 'wh', phoneme: '/w/', keyword: 'whistle', speechText: 'wh', type: 'digraph', unit: 'K-U3', emoji: '📯' },
  { id: 'ch', grapheme: 'ch', phoneme: '/tʃ/', keyword: 'chin', speechText: 'ch', type: 'digraph', unit: 'K-U3', emoji: '😊' },
  { id: 'sh', grapheme: 'sh', phoneme: '/ʃ/', keyword: 'ship', speechText: 'sh', type: 'digraph', unit: 'K-U3', emoji: '🚢' },
  { id: 'th', grapheme: 'th', phoneme: '/θ/', keyword: 'thumb', speechText: 'th', type: 'digraph', unit: 'K-U3', emoji: '👍' },
  { id: 'ck', grapheme: 'ck', phoneme: '/k/', keyword: 'sock', speechText: 'k', type: 'digraph', unit: 'K-U3', emoji: '🧦' },

  // === K-U4: Bonus Letters ===
  { id: 'ff', grapheme: 'ff', phoneme: '/f/', keyword: 'off', speechText: 'f', type: 'bonus_letter', unit: 'K-U4', emoji: '🔚' },
  { id: 'll', grapheme: 'll', phoneme: '/l/', keyword: 'hill', speechText: 'l', type: 'bonus_letter', unit: 'K-U4', emoji: '⛰️' },
  { id: 'ss', grapheme: 'ss', phoneme: '/s/', keyword: 'miss', speechText: 's', type: 'bonus_letter', unit: 'K-U4', emoji: '💨' },
  { id: 'zz', grapheme: 'zz', phoneme: '/z/', keyword: 'buzz', speechText: 'z', type: 'bonus_letter', unit: 'K-U4', emoji: '🐝' },

  // === K-U4: Glued Sound - all ===
  { id: 'all', grapheme: 'all', phoneme: '/ɔːl/', keyword: 'ball', speechText: 'all', type: 'glued_sound', unit: 'K-U4', emoji: '🏀' },

  // === K-U5: Glued Sounds - am, an ===
  { id: 'am', grapheme: 'am', phoneme: '/æm/', keyword: 'ham', speechText: 'am', type: 'glued_sound', unit: 'K-U5', emoji: '🍖' },
  { id: 'an', grapheme: 'an', phoneme: '/æn/', keyword: 'fan', speechText: 'an', type: 'glued_sound', unit: 'K-U5', emoji: '🌬️' },

  // === K-U7: Glued Sounds - ang, ing, ong, ung ===
  // === K-U6: Suffix ===
  { id: '-s', grapheme: '-s', phoneme: '/s/', keyword: 'sits', speechText: 's', type: 'suffix', unit: 'K-U6', emoji: '🪑' },

  { id: 'ang', grapheme: 'ang', phoneme: '/æŋ/', keyword: 'fang', speechText: 'ang', type: 'glued_sound', unit: 'K-U7', emoji: '🧛' },
  { id: 'ing', grapheme: 'ing', phoneme: '/ɪŋ/', keyword: 'ring', speechText: 'ing', type: 'glued_sound', unit: 'K-U7', emoji: '💍' },
  { id: 'ong', grapheme: 'ong', phoneme: '/ɒŋ/', keyword: 'song', speechText: 'ong', type: 'glued_sound', unit: 'K-U7', emoji: '🎵' },
  { id: 'ung', grapheme: 'ung', phoneme: '/ʌŋ/', keyword: 'lung', speechText: 'ung', type: 'glued_sound', unit: 'K-U7', emoji: '🫁' },

  // === K-U7: Glued Sounds - ank, ink, onk, unk ===
  { id: 'ank', grapheme: 'ank', phoneme: '/æŋk/', keyword: 'bank', speechText: 'ank', type: 'glued_sound', unit: 'K-U7', emoji: '🏦' },
  { id: 'ink', grapheme: 'ink', phoneme: '/ɪŋk/', keyword: 'pink', speechText: 'ink', type: 'glued_sound', unit: 'K-U7', emoji: '🩷' },
  { id: 'onk', grapheme: 'onk', phoneme: '/ɒŋk/', keyword: 'honk', speechText: 'onk', type: 'glued_sound', unit: 'K-U7', emoji: '📯' },
  { id: 'unk', grapheme: 'unk', phoneme: '/ʌŋk/', keyword: 'junk', speechText: 'unk', type: 'glued_sound', unit: 'K-U7', emoji: '🗑️' },
];

export function getSoundCardsForUnit(unitId: string): SoundCard[] {
  return soundCards.filter(card => card.unit === unitId);
}

export function getSoundCardById(id: string): SoundCard | undefined {
  return soundCards.find(card => card.id === id);
}

// Get all sound cards introduced up to and including a given unit
export function getSoundCardsUpToUnit(unitId: string): SoundCard[] {
  const unitOrder = [
    'K-U1', 'K-U2', 'K-U3', 'K-U4', 'K-U5', 'K-U6', 'K-U7',
    'L1-U1', 'L1-U2', 'L1-U3', 'L1-U4',
  ];
  const idx = unitOrder.indexOf(unitId);
  if (idx === -1) return [];
  const validUnits = unitOrder.slice(0, idx + 1);
  return soundCards.filter(card => validUnits.includes(card.unit));
}
