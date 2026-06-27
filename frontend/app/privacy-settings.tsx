import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function PrivacySettingsScreen() {
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>
          <Text style={styles.title}>Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={30} color="#024883" />
          </View>
          <Text style={styles.previewTitle}>Control your data</Text>
          <Text style={styles.previewText}>
            Manage how FlipValue uses your profile, item history, and app activity.
          </Text>
        </View>

        <View style={styles.card}>
          <PrivacyRow
            title="Personalized suggestions"
            subtitle="Use item history to improve price recommendations."
            value={personalizedSuggestions}
            onValueChange={setPersonalizedSuggestions}
          />
          <PrivacyRow
            title="Share app analytics"
            subtitle="Help improve FlipValue by sharing basic usage data."
            value={shareAnalytics}
            onValueChange={setShareAnalytics}
            isLast
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
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#cbd7e2', true: '#9fb6cd' }}
        thumbColor={value ? '#024883' : '#f4f4f4'}
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
});