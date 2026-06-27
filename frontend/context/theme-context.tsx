import { createContext, useContext, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}>({
  themeMode: 'light',
  setThemeMode: () => {},
  resolvedTheme: 'light',
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceTheme = useDeviceColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const resolvedTheme =
    themeMode === 'system' ? deviceTheme || 'light' : themeMode;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}