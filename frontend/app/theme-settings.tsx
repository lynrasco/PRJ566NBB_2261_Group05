import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const THEMES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System default', value: 'system' },
] as const;

export default function ThemeSettingsScreen() {
  const { themeMode, setThemeMode, resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = Colors[resolvedTheme];

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={[styles.previewCard, isDark && styles.previewCardDark]}>

        <Ionicons
        name={isDark ? 'moon' : 'sunny'}
        size={30}
        color={isDark ? '#8bbcff' : '#024883'}
        />
        <Text style={[styles.previewTitle, { color: colors.text }]}>
            {isDark ? 'Dark mode' : 'Light mode'}
        </Text>
        <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
            {themeMode === 'system'
            ? 'Using your device appearance setting.'
            : `Using ${themeMode} appearance.`}
        </Text>
    </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        {THEMES.map((theme) => {
          const isSelected = themeMode === theme.value;

          return (
            <Pressable
              key={theme.value}
              onPress={() => setThemeMode(theme.value)}
              style={[
                styles.row,
                isDark && styles.rowDark,
                isSelected && (isDark ? styles.rowSelectedDark : styles.rowSelected),
              ]}
            >
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {theme.label}
                </Text>
                <Text style={[styles.rowSubtitle, isDark && styles.rowSubtitleDark]}>
                  {theme.value === 'light'
                    ? 'Use a bright interface.'
                    : theme.value === 'dark'
                    ? 'Use a darker interface.'
                    : 'Match your device settings.'}
                </Text>
              </View>

              {isSelected && (
                <Ionicons
                name="checkmark-circle"
                size={22}
                color={isDark ? '#8bbcff' : '#024883'}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
    paddingHorizontal: 20,
    paddingTop: 58,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 22,
    color: '#111111',
  },
  headerSpacer: {
    width: 36,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  row: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d7e0ea',
  },
  rowSelected: {
    backgroundColor: '#e9f2fb',
  },
  rowTitle: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#111111',
  },
  rowSubtitle: {
    marginTop: 4,
    maxWidth: 230,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#52616f',
  },
  screenDark: {
    backgroundColor: '#08111f',
  },
  titleDark: {
    color: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#121c2b',
  },
  rowDark: {
    borderBottomColor: '#2d3a4a',
  },
  rowTitleDark: {
    color: '#ffffff',
  },
  rowSubtitleDark: {
    color: '#b8c4d1',
  },
  rowSelectedDark: {
    backgroundColor: '#1d2d44',
  },
  previewCard: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#ffffff',
  },
  previewCardDark: {
    backgroundColor: '#121c2b',
  },
  previewTitle: {
    marginTop: 10,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    color: '#111111',
  },
  previewTitleDark: {
    color: '#ffffff',
  },
  previewText: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#52616f',
  },
  previewTextDark: {
    color: '#b8c4d1',
  },
});