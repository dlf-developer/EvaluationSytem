// Secret Malkin Adorable Cute Theme Engine
export const TARGET_MALKIN_EMAIL = "nishachauhan@dlps.co.in";
export const SECRET_MALKIN_PIN = "Nnisha";
export const THEME_STORAGE_KEY = "cute_theme_malkin";

export const isMalkinAccount = (email) => {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === TARGET_MALKIN_EMAIL;
};

export const isCuteMalkinThemeActive = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(THEME_STORAGE_KEY) === "true";
};

export const setCuteMalkinTheme = (active) => {
  if (typeof window === "undefined") return;
  const isEnabled = Boolean(active);
  localStorage.setItem(THEME_STORAGE_KEY, isEnabled ? "true" : "false");

  if (isEnabled) {
    document.body.classList.add("cute-malkin-theme");
  } else {
    document.body.classList.remove("cute-malkin-theme");
  }

  // Notify listeners across all components
  window.dispatchEvent(
    new CustomEvent("cute-theme-changed", {
      detail: { active: isEnabled },
    })
  );
};

export const initCuteMalkinTheme = () => {
  if (typeof window === "undefined") return;
  const active = isCuteMalkinThemeActive();
  if (active) {
    document.body.classList.add("cute-malkin-theme");
  } else {
    document.body.classList.remove("cute-malkin-theme");
  }
};

// Cute magical chime synthesized via Web Audio API (Zero external MP3, instant 60fps audio)
export const playCuteMalkinChime = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Notes: C6, E6, G6, B6, C7 (Sparkling celestial harp arpeggio)
    const notes = [1046.5, 1318.5, 1567.98, 1975.53, 2093.0];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      // Bell-like envelope
      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.65);
    });
  } catch (e) {
    console.debug("Cute audio chime error", e);
  }
};

