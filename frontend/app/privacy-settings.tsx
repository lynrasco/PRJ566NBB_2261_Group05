import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';

export default function PrivacySettingsScreen() {
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <ScrollView contentContainerStyle={[styles.content, isDark && styles.contentDark,]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#ffffff' : '#111111'}/>
          </Pressable>
          <Text style={[styles.title, isDark && styles.textDark]}>
            Privacy
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.previewCard, isDark && styles.cardDark]}>
          <View style={[styles.iconCircle, isDark && styles.iconCircleDark, ]}>
            <Ionicons name="shield-checkmark-outline" size={30} color={isDark ? '#8bbcff' : '#024883'}/>
          </View>
          <Text style={[styles.previewTitle, isDark && styles.textDark]}>
            Control your data
          </Text>
          <Text style={[styles.previewText, isDark && styles.mutedTextDark,]}>
            Manage how FlipValue uses your profile, item history, and app activity.
          </Text>
        </View>

        <View style={[styles.previewCard, isDark && styles.cardDark]}>
          <PrivacyRow
            title="Personalized suggestions"
            subtitle="Use item history to improve price recommendations."
            value={personalizedSuggestions}
            onValueChange={setPersonalizedSuggestions}
            isDark={isDark}
          />
          <PrivacyRow
            title="Share app analytics"
            subtitle="Help improve FlipValue by sharing basic usage data."
            value={shareAnalytics}
            onValueChange={setShareAnalytics}
            isLast
            isDark={isDark}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function PrivacyRow({
  title,
  subtitle,
  value,
  onValueChange,
  isLast = false,
  isDark,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
  isDark: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, isDark && styles.textDark]}>{title}</Text>
        <Text style={[styles.rowSubtitle, isDark && styles.mutedTextDark,]}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: isDark ? '#3b4d61' : '#cbd7e2',
          true: '#9fb6cd',
        }}
        thumbColor={
          value
          ? '#024883'
          : isDark
            ? '#d9e2ec'
            : '#f4f4f4'
        }
        />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 21,
    color: '#111111',
  },
  headerSpacer: {
    width: 36,
  },
  previewCard: {
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)'
  },
  iconCircle: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: '#e9f2fb',
  },
  previewTitle: {
    marginTop: 12,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    color: '#111111',
  },
  previewText: {
    marginTop: 7,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#52616f',
  },
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)'
  },
  row: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d7e0ea',
  },
  rowCopy: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    color: '#111111',
  },
  rowSubtitle: {
    marginTop: 4,
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
  rowDark: {
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
});