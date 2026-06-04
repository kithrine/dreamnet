// sounds.ts
// -----------------------------------------------------------------------------
// Synthesized sound effects using the Web Audio API (no audio files, per spec).
// Three sounds: fire (wand shoots a star), pop (bubble bursts), rate (rating sent).
// A single shared AudioContext is created lazily on first use (browsers require
// audio to start from a user gesture, which our clicks satisfy).
// -----------------------------------------------------------------------------

let ctx: AudioContext | null = null;

// Lazily create / resume the shared AudioContext.
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null; // guard SSR
  if (!ctx) {
    // Safari uses the webkit-prefixed constructor.
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// Helper: play a simple oscillator tone with an envelope.
function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number): void {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
  // quick attack, smooth decay so it doesn't click
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur + 0.02);
}

// Helper: a short burst of filtered noise (used for the "pop").
function noiseBurst(dur: number, gain: number): void {
  const ac = audio();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames); // decaying noise
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.value = gain;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start();
}

// A rising sparkle when the wand fires a star.
export function playFire(): void {
  tone(420, 0.18, "triangle", 0.18, 900);
}

// A soft "pop" — short noise burst plus a quick blip.
export function playPop(): void {
  noiseBurst(0.12, 0.25);
  tone(660, 0.1, "sine", 0.12, 320);
}

// A pleasant little arpeggio when a rating is submitted.
export function playRate(): void {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, "sine", 0.14), i * 70);
  });
}
