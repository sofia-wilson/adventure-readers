import type { TrickWord } from '../types';

export const trickWords: TrickWord[] = [
  // === K-U2 ===
  // Phonetically regular HFW (can be sounded out)
  ...['sat', 'fun', 'leg', 'yes', 'map', 'lit', 'job'].map(w => ({ word: w, unit: 'K-U2', phonetic: true })),
  // Trick words (sight words — cannot be fully sounded out)
  ...['the', 'a', 'and', 'is', 'his', 'of'].map(w => ({ word: w, unit: 'K-U2', phonetic: false })),

  // === K-U3 ===
  ...['as', 'has'].map(w => ({ word: w, unit: 'K-U3', phonetic: true })),
  ...['to', 'into', 'we', 'he', 'she', 'be', 'me', 'for', 'or'].map(w => ({ word: w, unit: 'K-U3', phonetic: false })),

  // === K-U4 ===
  ...['you', 'your', 'I', 'they', 'was', 'one', 'said'].map(w => ({ word: w, unit: 'K-U4', phonetic: false })),

  // === K-U5 ===
  ...['from', 'have', 'do', 'does'].map(w => ({ word: w, unit: 'K-U5', phonetic: false })),

  // === K-U6 ===
  ...['were', 'are', 'who', 'what', 'when', 'where', 'there', 'here'].map(w => ({ word: w, unit: 'K-U6', phonetic: false })),

  // === K-U7 ===
  ...['why', 'by', 'my', 'try', 'put', 'two', 'too', 'very', 'also', 'some', 'come'].map(w => ({ word: w, unit: 'K-U7', phonetic: false })),

];

export function getTrickWordsForUnit(unitId: string): TrickWord[] {
  return trickWords.filter(w => w.unit === unitId);
}

export function getPhoneticHFWForUnit(unitId: string): TrickWord[] {
  return trickWords.filter(w => w.unit === unitId && w.phonetic);
}

export function getTrueTrickWordsForUnit(unitId: string): TrickWord[] {
  return trickWords.filter(w => w.unit === unitId && !w.phonetic);
}

// Get all trick words from units 2-7 for review
export function getAllTrickWords(): TrickWord[] {
  return trickWords.filter(w => !w.phonetic);
}
