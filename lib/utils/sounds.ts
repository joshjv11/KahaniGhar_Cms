// Sound utility for UI feedback
// Uses Web Audio API to generate pleasant sounds

export type SoundType = 'click' | 'success' | 'error' | 'delete' | 'save' | 'toggle' | 'hover';

let audioContext: AudioContext | null = null;

// Initialize audio context on first user interaction
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported');
      return null;
    }
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  
  return audioContext;
};

// Check if user prefers reduced motion/sound
const shouldPlaySounds = () => {
  if (typeof window === 'undefined') return false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const soundEnabled = localStorage.getItem('ui-sounds-enabled') !== 'false';
  return !prefersReducedMotion && soundEnabled;
};

// Generate a pleasant chime sound
const generateChime = (frequency: number, duration: number = 0.1, type: 'sine' | 'triangle' = 'sine') => {
  const ctx = getAudioContext();
  if (!ctx || !shouldPlaySounds()) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Smooth envelope - louder and more noticeable
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {
    // Silently fail if audio can't be played
  }
};

// Generate a bell-like sound
const generateBell = (baseFreq: number = 800) => {
  const ctx = getAudioContext();
  if (!ctx || !shouldPlaySounds()) return;
  
  try {
    // Bell has multiple harmonics
    const harmonics = [1, 2.76, 5.4, 8.93];
    harmonics.forEach((harmonic, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = baseFreq * harmonic;
      oscillator.type = 'sine';
      
      const delay = index * 0.01;
      const duration = 0.3 - delay;
      const volume = 0.3 / (index + 1);
      const now = ctx.currentTime;
      
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      
      oscillator.start(now + delay);
      oscillator.stop(now + delay + duration);
    });
  } catch (e) {
    // Silently fail
  }
};

// Generate a success chime (ascending notes)
const generateSuccess = () => {
  if (!audioContext || !shouldPlaySounds()) return;
  
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
  notes.forEach((freq, index) => {
    setTimeout(() => {
      generateChime(freq, 0.2, 'sine');
    }, index * 50);
  });
};

// Generate an error sound (descending notes)
const generateError = () => {
  if (!audioContext || !shouldPlaySounds()) return;
  
  const notes = [400, 300, 200];
  notes.forEach((freq, index) => {
    setTimeout(() => {
      generateChime(freq, 0.15, 'triangle');
    }, index * 40);
  });
};

// Generate a delete sound (low, brief)
const generateDelete = () => {
  if (!audioContext || !shouldPlaySounds()) return;
  generateChime(200, 0.1, 'triangle');
};

// Generate a save sound (pleasant bell)
const generateSave = () => {
  if (!audioContext || !shouldPlaySounds()) return;
  generateBell(600);
};

// Generate a toggle sound (quick click)
const generateToggle = () => {
  if (!audioContext || !shouldPlaySounds()) return;
  generateChime(600, 0.05, 'sine');
};

// Generate a hover sound (very subtle)
const generateHover = () => {
  if (!audioContext || !shouldPlaySounds()) return;
  generateChime(800, 0.03, 'sine');
};

export const playSound = (type: SoundType) => {
  // Initialize audio context on first play
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    switch (type) {
      case 'click':
        generateChime(600, 0.1, 'sine');
        break;
      case 'success':
        generateSuccess();
        break;
      case 'error':
        generateError();
        break;
      case 'delete':
        generateDelete();
        break;
      case 'save':
        generateSave();
        break;
      case 'toggle':
        generateToggle();
        break;
      case 'hover':
        generateHover();
        break;
      default:
        generateChime(600, 0.1, 'sine');
    }
  } catch (e) {
    // Silently fail
  }
};

// Toggle sound on/off
export const setSoundEnabled = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ui-sounds-enabled', enabled.toString());
  }
};

export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('ui-sounds-enabled') !== 'false';
};
