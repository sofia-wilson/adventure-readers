// Phoneme-to-speech mapping for Web Speech API
//
// IMPORTANT PHONICS NOTE: Consonant sounds must NOT add an extra vowel.
// Stop consonants (b, c, d, g, j, k, p, t) are nearly impossible for TTS
// to say in isolation without adding "uh". For these, we speak the keyword
// word instead and let the sound card visuals + parent model the isolated sound.
//
// Continuant consonants (f, h, l, m, n, r, s, v, w, z) can be sustained
// without a vowel, so TTS works for these.

// Stop consonants use their keyword for TTS (the parent models the clipped sound)
// The UI will show "Listen: bat" to make it clear we're saying the keyword
const STOP_CONSONANTS = new Set(['b', 'c', 'd', 'g', 'j', 'k', 'p', 'qu', 't']);

interface SpeechConfig {
  text: string;
  rate: number;
  pitch: number;
}

const phonemeSpeechMap: Record<string, SpeechConfig> = {
  // Short vowels — clear, isolated sounds
  'a': { text: 'ah', rate: 0.6, pitch: 1.0 },
  'e': { text: 'eh', rate: 0.6, pitch: 1.0 },
  'i': { text: 'ih', rate: 0.6, pitch: 1.0 },
  'o': { text: 'aw', rate: 0.6, pitch: 1.0 },
  'u': { text: 'uh', rate: 0.6, pitch: 1.0 },

  // Stop consonants — say the keyword word so child hears the sound in context
  // Parent should model the clipped sound; TTS cannot clip stop consonants
  'b': { text: 'bat', rate: 0.7, pitch: 1.0 },
  'c': { text: 'cat', rate: 0.7, pitch: 1.0 },
  'd': { text: 'dog', rate: 0.7, pitch: 1.0 },
  'g': { text: 'game', rate: 0.7, pitch: 1.0 },
  'j': { text: 'jug', rate: 0.7, pitch: 1.0 },
  'k': { text: 'kite', rate: 0.7, pitch: 1.0 },
  'p': { text: 'pan', rate: 0.7, pitch: 1.0 },
  'qu': { text: 'queen', rate: 0.7, pitch: 1.0 },
  't': { text: 'top', rate: 0.7, pitch: 1.0 },

  // Continuant consonants — these CAN be sustained without a vowel
  'f': { text: 'ffff', rate: 0.5, pitch: 1.0 },
  'h': { text: 'hhhh', rate: 0.5, pitch: 1.0 },
  'l': { text: 'llll', rate: 0.5, pitch: 1.0 },
  'm': { text: 'mmmm', rate: 0.5, pitch: 1.0 },
  'n': { text: 'nnnn', rate: 0.5, pitch: 1.0 },
  'r': { text: 'rrrr', rate: 0.5, pitch: 1.0 },
  's': { text: 'ssss', rate: 0.5, pitch: 1.0 },
  'v': { text: 'vvvv', rate: 0.5, pitch: 1.0 },
  'w': { text: 'wwww', rate: 0.5, pitch: 1.0 },
  'x': { text: 'ks', rate: 0.7, pitch: 1.0 },
  'y': { text: 'yyyy', rate: 0.5, pitch: 1.0 },
  'z': { text: 'zzzz', rate: 0.5, pitch: 1.0 },

  // Digraphs — ch and ck are stops; sh, th, wh are continuants
  'wh': { text: 'whhh', rate: 0.5, pitch: 1.0 },
  'ch': { text: 'chin', rate: 0.7, pitch: 1.0 },
  'sh': { text: 'shhh', rate: 0.5, pitch: 1.0 },
  'th': { text: 'thhh', rate: 0.5, pitch: 1.0 },
  'ck': { text: 'sock', rate: 0.7, pitch: 1.0 },

  // Bonus letters (all continuants)
  'ff': { text: 'ffff', rate: 0.5, pitch: 1.0 },
  'll': { text: 'llll', rate: 0.5, pitch: 1.0 },
  'ss': { text: 'ssss', rate: 0.5, pitch: 1.0 },
  'zz': { text: 'zzzz', rate: 0.5, pitch: 1.0 },

  // Glued/welded sounds — always spoken as one unit
  'all': { text: 'all', rate: 0.65, pitch: 1.0 },
  'am': { text: 'am', rate: 0.65, pitch: 1.0 },
  'an': { text: 'an', rate: 0.65, pitch: 1.0 },
  'ang': { text: 'ang', rate: 0.65, pitch: 1.0 },
  'ing': { text: 'ing', rate: 0.65, pitch: 1.0 },
  'ong': { text: 'ong', rate: 0.65, pitch: 1.0 },
  'ung': { text: 'ung', rate: 0.65, pitch: 1.0 },
  'ank': { text: 'ank', rate: 0.65, pitch: 1.0 },
  'ink': { text: 'ink', rate: 0.65, pitch: 1.0 },
  'onk': { text: 'onk', rate: 0.65, pitch: 1.0 },
  'unk': { text: 'unk', rate: 0.65, pitch: 1.0 },
};

export function isStopConsonant(soundId: string): boolean {
  return STOP_CONSONANTS.has(soundId);
}

export function speakSound(soundId: string): void {
  const config = phonemeSpeechMap[soundId];
  if (!config) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(config.text);
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function speakWord(word: string): void {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.6;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Speak each sound in sequence, then the blended word
export function speakBlendSequence(sounds: string[], word: string): Promise<void> {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    let index = 0;
    const speakNext = () => {
      if (index < sounds.length) {
        const config = phonemeSpeechMap[sounds[index]] || { text: sounds[index], rate: 0.7, pitch: 1.0 };
        const utterance = new SpeechSynthesisUtterance(config.text);
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        utterance.onend = () => {
          index++;
          setTimeout(speakNext, 300);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Pause, then speak the blended word
        setTimeout(() => {
          const wordUtterance = new SpeechSynthesisUtterance(word);
          wordUtterance.rate = 0.7;
          wordUtterance.pitch = 1.0;
          wordUtterance.onend = () => resolve();
          window.speechSynthesis.speak(wordUtterance);
        }, 500);
      }
    };
    speakNext();
  });
}
