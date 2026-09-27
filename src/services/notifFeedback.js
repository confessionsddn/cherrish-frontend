// services/notifFeedback.js
// Lightweight in-app feedback for live notifications: a short synthesized
// chime (no audio asset needed) and a device vibration. Respects a user mute
// preference stored in localStorage.

const MUTE_KEY = 'notif_sound_muted';

export function isNotifMuted() {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function setNotifMuted(muted) {
  localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
}

// Reuse a single AudioContext; created lazily on first sound so it can attach
// to a user-gesture-unlocked context where possible.
let audioCtx = null;

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    // Some browsers suspend the context until a gesture; resume best-effort.
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const now = audioCtx.currentTime;
    // Two quick soft notes — a pleasant "ding-ding".
    [880, 1174.66].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {
    /* audio not available — ignore */
  }
}

function vibrate() {
  try {
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
  } catch {
    /* vibration not supported — ignore */
  }
}

/** Fire sound + vibration for an incoming notification, unless muted. */
export function playNotifFeedback() {
  if (isNotifMuted()) return;
  playChime();
  vibrate();
}
