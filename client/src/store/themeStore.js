import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('zyntra_theme');
  if (saved) return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('zyntra_theme', theme);
};

export const useThemeStore = create((set, get) => {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      set({ theme: nextTheme });
    },
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
  };
});

export default useThemeStore;
