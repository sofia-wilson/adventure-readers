// Fun space sound effects using Web Audio API — no external files needed

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Create white noise for applause/rocket rumble effects
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Rocket launch + fanfare + applause celebration!
export function playGotItSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // === Part 1: Rocket launch whoosh (0 - 0.6s) ===
    const noiseBuffer = createNoiseBuffer(ctx, 1.5);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(500, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.5);
    noiseFilter.Q.value = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.8);

    // === Part 2: Victory fanfare (0.3 - 1.0s) ===
    const fanfare = [
      { freq: 523, start: 0.3, dur: 0.15 },  // C5
      { freq: 659, start: 0.42, dur: 0.15 },  // E5
      { freq: 784, start: 0.54, dur: 0.15 },  // G5
      { freq: 1047, start: 0.66, dur: 0.4 },  // C6 — hold!
    ];

    fanfare.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, now + start);
      gain.gain.setValueAtTime(0.12, now + start + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });

    // === Part 3: Sparkle shimmer (0.8 - 1.5s) ===
    for (let i = 0; i < 6; i++) {
      const sparkle = ctx.createOscillator();
      const sGain = ctx.createGain();
      sparkle.type = 'sine';
      sparkle.frequency.value = 1500 + Math.random() * 2500;
      const t = 0.8 + i * 0.08;
      sGain.gain.setValueAtTime(0.08, now + t);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.15);
      sparkle.connect(sGain);
      sGain.connect(ctx.destination);
      sparkle.start(now + t);
      sparkle.stop(now + t + 0.2);
    }

    // === Part 4: Applause-like crackle (0.5 - 1.8s) ===
    const applause = ctx.createBufferSource();
    applause.buffer = createNoiseBuffer(ctx, 2);

    const applauseFilter = ctx.createBiquadFilter();
    applauseFilter.type = 'highpass';
    applauseFilter.frequency.value = 3000;

    const applauseGain = ctx.createGain();
    applauseGain.gain.setValueAtTime(0, now + 0.5);
    applauseGain.gain.linearRampToValueAtTime(0.12, now + 0.8);
    applauseGain.gain.setValueAtTime(0.12, now + 1.2);
    applauseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    applause.connect(applauseFilter);
    applauseFilter.connect(applauseGain);
    applauseGain.connect(ctx.destination);
    applause.start(now + 0.5);
    applause.stop(now + 2);

  } catch {
    // Audio not available
  }
}

// Gentle encouraging tone for Not quite
export function playNotQuiteSound(): void {
  // Intentionally silent — no sound on "not quite" to avoid discouraging the child
}
