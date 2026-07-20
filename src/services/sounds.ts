/**
 * Sound effects for Omeagle using the Web Audio API.
 * Uses programmatically generated tones — no external files needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Play a pleasant 2-tone "match found" chime (rising major third).
 */
export function playMatchFound(): void {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const tones = [
      { freq: 523.25, start: 0, dur: 0.18 },   // C5
      { freq: 659.25, start: 0.15, dur: 0.25 },  // E5
    ];

    tones.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.35, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  } catch {
    // Silently fail if audio context is unavailable
  }
}

/**
 * Play a soft single-tone "message received" ping.
 */
export function playMessageReceived(): void {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 880; // A5 — bright, gentle ping

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Silently fail if audio context is unavailable
  }
}

/**
 * Resume AudioContext after user gesture (required by browsers).
 * Call this on any user interaction.
 */
export function unlockAudio(): void {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // ignore
  }
}
