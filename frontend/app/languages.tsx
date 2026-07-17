import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/hooks/use-translation';

const LANGUAGES = [
  {
    code: 'EN',
    name: 'English',
    locale: 'en',
  },
  {
    code: 'FR',
    name: 'Français',
    locale: 'fr',
  },
  {
    code: 'ES',
    name: 'Español',
    locale: 'es',
  },
  {
    code: 'DE',
    name: 'Deutsch',
    locale: 'de',
  },
];

export default function LanguagesScreen() {
  const { resolvedTheme } = useAppTheme();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();
  const isDark = resolvedTheme === 'dark';

  return (
    <ScrollView
      contentContainerStyle={[styles.content, isDark && styles.contentDark, ]}
      showsVerticalScrollIndicator={false}
      style={[styles.screen, isDark && styles.screenDark,]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#ffffff' : '#111111'}/>
        </Pressable>

        <Text style={[styles.title, isDark && styles.textDark]}>
          {t('language')}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.previewCard, isDark && styles.cardDark,]}>
        <View style={[styles.iconCircle, isDark && styles.iconCircleDark,]}>
            <Ionicons name="language-outline" size={28} color={isDark ? '#8bbcff' : '#024883'}/>
        </View>
       <Text style={[styles.previewTitle, isDark && styles.textDark,]}>
          {t('appLanguage')}
        </Text>
        <Text style={[styles.previewText, isDark && styles.mutedTextDark]}>
            {t('languageDesc')}
        </Text>
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        {LANGUAGES.map((item, index) => (
          <Pressable
  key={item.locale}
  onPress={() => setLanguage(item.locale)}
  style={({ pressed }) => [
    styles.row,
    index !== LANGUAGES.length - 1 && styles.rowBorder,
    isDark && styles.rowDark,
    pressed &&
      (isDark
        ? styles.cardPressedDark
        : styles.cardPressed),
  ]}
>
  <View style={styles.languageLeft}>
    <View style={[styles.codeBadge, isDark && styles.codeBadgeDark]}>
      <Text
        style={[
          styles.codeText,
          isDark && styles.textDark,
        ]}
      >
        {item.code}
      </Text>
    </View>

    <Text
      style={[
        styles.languageText,
        isDark && styles.textDark,
      ]}
    >
      {item.name}
    </Text>
  </View>

  {language === item.locale && (
    <Ionicons
      name="checkmark"
      size={22}
      color={isDark ? '#8bbcff' : '#024883'}
    />
  )}
</Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  content: {
    flexGrow: 1,
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.55,
  },
  title: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 21,
    color: '#111111',
  },
  optionCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingLeft: 31,
    paddingRight: 17,
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)',
  },
  cardPressed: {
    backgroundColor: '#eeeeee',
  },
  optionLabel: {
    flex: 1,
    paddingRight: 16,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#050505',
  },
  optionValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  optionValue: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 15,
    color: '#111111',
  },
  previewCard: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#e9f2fb',
  },
  previewTitle: {
    marginTop: 10,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    color: '#111111',
  },
  previewText: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#52616f',
  },
  screenDark: {
    backgroundColor: '#08111f',
  },
  contentDark: {
    backgroundColor: '#08111f',
  },
  cardDark: {
    backgroundColor: '#121c2b',
  },
  iconCircleDark: {
    backgroundColor: '#1d2d44',
  },
  textDark: {
    color: '#ffffff',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  cardPressedDark: {
    backgroundColor: '#1d2d44',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerSpacer: {
    width: 36,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    boxShadow: ''
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d7e0ea',
  },
  rowDark: {
    backgroundColor: '#121c2b',
  },
  languageText: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 15,
    color: '#111111',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBadge: {
    width: 42,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eef3f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  codeBadgeDark: {
    backgroundColor: '#1d2d44',
  },
  codeText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    color: '#024883',
  },
});