import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from './store';

const THEME_KEY = 'theme';

// Get initial state from localStorage or default to light
const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const theme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === null && systemPrefersDark);
    
    // Initialize the DOM on first load
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return { isDark };
  }
  return { isDark: false };
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialState(),
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem(THEME_KEY, state.isDark ? 'dark' : 'light');
      // Update DOM
      const root = document.documentElement;
      if (state.isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }
});

// Export actions and selectors
export const { toggleTheme } = themeSlice.actions;
export const selectIsDark = (state: RootState) => state.theme.isDark;

// Export reducer as default
export default themeSlice.reducer;