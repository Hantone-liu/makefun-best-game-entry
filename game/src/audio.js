// Prism Panes — every sound is synthesized with WebAudio: no audio files,
// no network, nothing to download. The context starts on the first user
// gesture, as browsers require.

let ctx = null;
let muted = false;

function ensure() {
  if (ctx === null) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call from any user gesture so later sounds are allowed to play. */
export function unlockAudio() {
  ensure();
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, startIn, duration, type, gainValue) {
  const audio = ensure();
  if (audio === null || muted) return;
  const now = audio.currentTime + startIn;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

/** A short mechanical click when a mirror turns. */
export function playRotate() {
  tone(620, 0, 0.07, 'square', 0.05);
  tone(930, 0.02, 0.05, 'square', 0.03);
}

/** A bright two-note chime when a target lights up. */
export function playConnect() {
  tone(523.25, 0, 0.14, 'sine', 0.09);
  tone(783.99, 0.09, 0.22, 'sine', 0.09);
}

/** A dull thud when a beam hits a target of the wrong colour. */
export function playWrong() {
  tone(160, 0, 0.16, 'sawtooth', 0.05);
}

/** A rising arpeggio when a level is completed. */
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, index) => tone(freq, index * 0.09, 0.24, 'triangle', 0.1));
}

/** A low falling tone when the timer runs out. */
export function playFail() {
  tone(220, 0, 0.3, 'sawtooth', 0.07);
  tone(146.83, 0.18, 0.45, 'sawtooth', 0.07);
}

/** A single tick when the timer drops under ten seconds. */
export function playTick() {
  tone(880, 0, 0.05, 'square', 0.035);
}
