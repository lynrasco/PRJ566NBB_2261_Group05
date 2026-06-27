import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Audiowide_400Regular } from '@expo-google-fonts/audiowide';
import { AzeretMono_400Regular, AzeretMono_700Bold } from '@expo-google-fonts/azeret-mono';
import { AppThemeProvider, useAppTheme } from '@/context/theme-context';
import { View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { resolvedTheme } = useAppTheme();

  const bg = resolvedTheme === 'dark' ? '#08111f' : '#eef3f8';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>

        <StatusBar
          style={resolvedTheme === 'dark' ? 'light' : 'dark'}
          backgroundColor={bg}
        />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Audiowide_400Regular,
    AzeretMono_400Regular,
    AzeretMono_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  );
}