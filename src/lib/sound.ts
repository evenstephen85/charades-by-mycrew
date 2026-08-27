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

function noiseBurst(startTime: number, duration: number, gain = 0.3) {
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
  source.connect(gainNode);
  gainNode.connect(c.destination);
  source.start(startTime);
}

export function playCorrect() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(660, t, 0.08, { type: 'triangle', gain: 0.3 });
  tone(880, t + 0.08, 0.12, { type: 'triangle', gain: 0.3 });
}

export function playSkip() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(300, t, 0.18, { type: 'sawtooth', gain: 0.2, sweepTo: 180 });
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

export function playFanfare() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
  const gap = 0.16;
  notes.forEach((freq, i) => {
    tone(freq, t + i * gap, gap * 1.4, { type: 'triangle', gain: 0.28 });
    tone(freq / 2, t + i * gap, gap * 1.4, { type: 'sine', gain: 0.15 });
  });
}
