import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../theme/themes';

const THEME_KEY = 'myjournal_theme';
const THEME_MODE_KEY = 'myjournal_theme_mode';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeId, setThemeId] = useState('candy-dreams');
  const [nightMode, setNightMode] = useState(null);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, THEME_MODE_KEY]).then(([t, m]) => {
      if (t[1]) setThemeId(t[1]);
      if (m[1]) setNightMode(m[1] === 'night');
    });
  }, []);

  const isNight = nightMode === null ? systemScheme === 'dark' : nightMode;

  const theme = useMemo(() => {
    const t = THEMES.find(t => t.id === themeId) || THEMES[0];
    return t[isNight ? 'night' : 'day'];
  }, [themeId, isNight]);

  const themeMeta = useMemo(() => {
    return THEMES.find(t => t.id === themeId) || THEMES[0];
  }, [themeId]);

  const setTheme = async (id) => {
    setThemeId(id);
    await AsyncStorage.setItem(THEME_KEY, id);
  };

  const toggleMode = async () => {
    const newMode = !isNight;
    setNightMode(newMode);
    await AsyncStorage.setItem(THEME_MODE_KEY, newMode ? 'night' : 'day');
  };

  const setMode = async (night) => {
    setNightMode(night);
    await AsyncStorage.setItem(THEME_MODE_KEY, night ? 'night' : 'day');
  };

  return (
    <ThemeContext.Provider value={{
      theme, themeMeta, themeId, isNight,
      setTheme, toggleMode, setMode, THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
