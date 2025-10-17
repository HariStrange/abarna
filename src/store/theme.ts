import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      return { theme: newTheme };
    });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    set({ theme });
  },

  initializeTheme: () => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const theme = storedTheme || 'light';
    document.documentElement.classList.add(theme);
    set({ theme });
  },
}));
