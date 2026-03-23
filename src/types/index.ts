export type SoundType = 'consonant' | 'short_vowel' | 'digraph' | 'glued_sound' | 'bonus_letter' | 'suffix';

export interface SoundCard {
  id: string;
  grapheme: string;
  phoneme: string;
  keyword: string;
  speechText: string;
  type: SoundType;
  unit: string;
  emoji: string;
}

export interface BlendingWord {
  word: string;
  sounds: string[]; // each element is a grapheme (may be multi-char for digraphs/glued sounds)
  unit: string;
  suffix?: number; // number of sounds at the end that form the suffix (e.g., 1 for "-s")
}

export interface TrickWord {
  word: string;
  unit: string;
  phonetic: boolean; // true = phonetically regular HFW, false = true trick/sight word
}

export type Rating = 'green' | 'yellow' | 'red';

export interface AttemptRecord {
  unitId: string;
  activityType: 'sound_drill' | 'blending' | 'trick_word';
  itemId: string;
  rating: Rating;
  timestamp: number;
}

export interface UnitProgress {
  unitId: string;
  totalAttempts: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  mastery: number; // 0-100
  unlocked: boolean;
  completed: boolean;
}

export interface Unit {
  id: string;
  name: string;
  level: string;
  description: string;
  planetName: string;
  planetColor: string;
  activities: ('sound_drill' | 'blending' | 'phonetic_hfw' | 'trick_word' | 'unit_sentences' | 'blending_review' | 'trick_review' | 'sentences')[];
}
