let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Must be called from a user-gesture handler (tap) to unlock audio on iOS/Safari. */
export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  const buffer = c.createBuffer(1, 1, 22050);
  const source = c.createBufferSource();
  source.buffer = buffer;
  source.connect(c.destination);
  source.start(0);
}

function tone(
  frequency: number,
  startTime: number,
  duration: number,
  options: { type?: OscillatorType; gain?: number; sweepTo?: number } = {},
) {
  const c = getCtx();
  if (!c) return;
  const { type = 'sine', gain = 0.25, sweepTo } = options;
  const osc = c.createOscillator();
  const gainNode = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  if (sweepTo !== undefined) {
    osc.frequency.linearRampToValueAtTime(sweepTo, startTime + duration);
  }
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(c.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function noiseBurst(
  startTime: number,
  duration: number,
  gain = 0.3,
  options: { filterFrom?: number; filterTo?: number; filterType?: BiquadFilterType } = {},
) {
  const c = getCtx();
  if (!c) return;
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain, startTime);

  let outputNode: AudioNode = source;
  if (options.filterFrom !== undefined && options.filterTo !== undefined) {
    const filter = c.createBiquadFilter();
    filter.type = options.filterType ?? 'bandpass';
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(options.filterFrom, startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, options.filterTo), startTime + duration);
    source.connect(filter);
    outputNode = filter;
  }

  outputNode.connect(gainNode);
  gainNode.connect(c.destination);
  source.start(startTime);
}

/** Bright ascending chime + coin "ting" — plays when a guess is marked correct. */
export function playCorrect() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(1046.5, t, 0.09, { type: 'square', gain: 0.22 });
  tone(1567.98, t + 0.07, 0.16, { type: 'square', gain: 0.22 });
  tone(2093, t + 0.07, 0.16, { type: 'sine', gain: 0.12 });
}

/** Quick filtered noise sweep — plays when a word is skipped, and during the intro transition. */
export function playWhoosh(duration = 0.32) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  noiseBurst(t, duration, 0.35, { filterFrom: 2200, filterTo: 180, filterType: 'bandpass' });
}

/** Soft UI click — plays on any tap while sound is on. */
export function playBoop() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(520, t, 0.05, { type: 'sine', gain: 0.09 });
  tone(780, t + 0.02, 0.05, { type: 'sine', gain: 0.05 });
}

export function playCountdownTick() {
  const c = getCtx();
  if (!c) return;
  tone(880, c.currentTime, 0.08, { type: 'square', gain: 0.15 });
}

export function playGo() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(523.25, t, 0.12, { type: 'triangle', gain: 0.3 });
  tone(783.99, t + 0.12, 0.22, { type: 'triangle', gain: 0.3 });
}

export function playWarning() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(440, t, 0.1, { type: 'square', gain: 0.2 });
  tone(440, t + 0.15, 0.1, { type: 'square', gain: 0.2 });
}

export function playBuzzer() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(150, t, 0.5, { type: 'sawtooth', gain: 0.3, sweepTo: 90 });
  noiseBurst(t, 0.15, 0.15);
}

export function playDrumroll(durationSeconds: number) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const hitInterval = 0.09;
  const hits = Math.floor(durationSeconds / hitInterval);
  for (let i = 0; i < hits; i++) {
    noiseBurst(t + i * hitInterval, hitInterval * 0.9, 0.18 + (i / hits) * 0.15);
  }
}

/** Triumphant "ta-da" — plays the instant the winner is revealed. */
export function playTaDa() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const notes: [number, number, number][] = [
    [523.25, 0, 0.18],
    [659.25, 0.1, 0.18],
    [783.99, 0.2, 0.5],
    [1046.5, 0.24, 0.55],
  ];
  for (const [freq, offset, dur] of notes) {
    tone(freq, t + offset, dur, { type: 'triangle', gain: 0.28 });
    tone(freq / 2, t + offset, dur, { type: 'sine', gain: 0.16 });
  }
}
