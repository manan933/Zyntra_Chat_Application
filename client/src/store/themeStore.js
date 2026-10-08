import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('zyntra_theme');
  if (saved) return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const ACCENTS = {
  blue: { accent: '#3b82f6', hover: '#2563eb', subtle: 'rgba(59, 130, 246, 0.15)' },
  purple: { accent: '#8b5cf6', hover: '#7c3aed', subtle: 'rgba(139, 92, 246, 0.15)' },
  emerald: { accent: '#10b981', hover: '#059669', subtle: 'rgba(16, 185, 129, 0.15)' },
  amber: { accent: '#f59e0b', hover: '#d97706', subtle: 'rgba(245, 158, 11, 0.15)' },
  rose: { accent: '#f43f5e', hover: '#e11d48', subtle: 'rgba(244, 63, 94, 0.15)' },
};

const applyRootStyles = (theme, accentColor, fontScale) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem('zyntra_theme', theme);

  const colors = ACCENTS[accentColor] || ACCENTS.blue;
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-hover', colors.hover);
  root.style.setProperty('--accent-subtle', colors.subtle);
  root.style.setProperty('--bubble-sent', colors.accent);

  if (fontScale === 'compact') {
    root.style.setProperty('--font-scale', '0.9');
  } else if (fontScale === 'comfortable') {
    root.style.setProperty('--font-scale', '1.08');
  } else {
    root.style.setProperty('--font-scale', '1');
  }
};

export const useThemeStore = create((set, get) => {
  const initialTheme = getInitialTheme();
  const initialAccent = localStorage.getItem('zyntra_accent') || 'blue';
  const initialWallpaper = localStorage.getItem('zyntra_wallpaper') || 'default';
  const initialSound = localStorage.getItem('zyntra_sound') !== 'false';
  const initialFontScale = localStorage.getItem('zyntra_font_scale') || 'normal';

  applyRootStyles(initialTheme, initialAccent, initialFontScale);

  return {
    theme: initialTheme,
    accentColor: initialAccent,
    wallpaper: initialWallpaper,
    soundEnabled: initialSound,
    fontScale: initialFontScale,

    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      applyRootStyles(nextTheme, get().accentColor, get().fontScale);
      set({ theme: nextTheme });
    },

    setTheme: (theme) => {
      applyRootStyles(theme, get().accentColor, get().fontScale);
      set({ theme });
    },

    setAccentColor: (accentColor) => {
      localStorage.setItem('zyntra_accent', accentColor);
      applyRootStyles(get().theme, accentColor, get().fontScale);
      set({ accentColor });
    },

    setWallpaper: (wallpaper) => {
      localStorage.setItem('zyntra_wallpaper', wallpaper);
      set({ wallpaper });
    },

    setSoundEnabled: (soundEnabled) => {
      localStorage.setItem('zyntra_sound', String(soundEnabled));
      set({ soundEnabled });
    },

    setFontScale: (fontScale) => {
      localStorage.setItem('zyntra_font_scale', fontScale);
      applyRootStyles(get().theme, get().accentColor, fontScale);
      set({ fontScale });
    },
  };
});

export default useThemeStore;
