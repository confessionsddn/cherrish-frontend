// frontend/src/context/ThemeContext.jsx
// COMPLETE THEME SYSTEM - Dark mode + Gift themes
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Available themes with unlock requirements
export const THEMES = {
  light: {
    id: 'light',
    name: 'Default',
    emoji: '☀️',
    requiredGifts: 0,
    free: true
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    emoji: '🌙',
    requiredGifts: 0,
    free: true
  },
  'midnight-rose': {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    emoji: '🌹',
    requiredGifts: 50,
    free: false
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    emoji: '✨',
    requiredGifts: 100,
    free: false
  },
  'neon-cyberpunk': {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    emoji: '⚡',
    requiredGifts: 200,
    free: false
  }
};

export function ThemeProvider({ children, user }) {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [unlockedThemes, setUnlockedThemes] = useState(['light', 'dark']);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('lc_theme') || 'light';
    const savedAuto = localStorage.getItem('lc_auto_mode') === 'true';

    setIsAutoMode(savedAuto);

    if (savedAuto) {
      applyAutoMode();
    } else {
      applyTheme(savedTheme);
    }
  }, []);

  // Update unlocked themes when user gifts change
  useEffect(() => {
    if (user) {
      const giftsReceived = user.gifts_received || 0;
      const unlocked = ['light', 'dark'];

      if (giftsReceived >= 50) unlocked.push('midnight-rose');
      if (giftsReceived >= 100) unlocked.push('golden-hour');
      if (giftsReceived >= 200) unlocked.push('neon-cyberpunk');

      setUnlockedThemes(unlocked);
    }
  }, [user]);

  // Auto mode - follows system preference
  useEffect(() => {
    if (!isAutoMode) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyAutoMode();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAutoMode]);

  const applyAutoMode = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
  };

  const applyTheme = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId);
    setCurrentTheme(themeId);
  };

  const switchTheme = (themeId) => {
    if (!unlockedThemes.includes(themeId)) return false;

    setIsAutoMode(false);
    localStorage.setItem('lc_auto_mode', 'false');
    localStorage.setItem('lc_theme', themeId);
    applyTheme(themeId);
    return true;
  };

  const toggleDarkMode = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    switchTheme(newTheme);
  };

  const toggleAutoMode = () => {
    const newAuto = !isAutoMode;
    setIsAutoMode(newAuto);
    localStorage.setItem('lc_auto_mode', newAuto.toString());

    if (newAuto) {
      applyAutoMode();
    }
  };

  const isDark = currentTheme === 'dark' ||
    currentTheme === 'midnight-rose' ||
    currentTheme === 'golden-hour' ||
    currentTheme === 'neon-cyberpunk';

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      isDark,
      isAutoMode,
      unlockedThemes,
      switchTheme,
      toggleDarkMode,
      toggleAutoMode,
      themes: THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
