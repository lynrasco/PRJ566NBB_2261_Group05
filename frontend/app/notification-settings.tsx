import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function NotificationSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={30} color="#024883" />
          </View>
          <Text style={styles.previewTitle}>Stay updated</Text>
          <Text style={styles.previewText}>
            Choose which alerts FlipValue can send about your items and account.
          </Text>
        </View>

        <View style={styles.card}>
          <NotificationRow
            title="Enable notifications"
            subtitle="Allow FlipValue to send alerts."
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />

          <NotificationRow
            title="Price suggestions"
            subtitle="Get notified when a price estimate is ready."
            value={priceAlerts}
            onValueChange={setPriceAlerts}
            disabled={!pushEnabled}
          />

          <NotificationRow
            title="Marketplace updates"
            subtitle="Receive updates from similar listings."
            value={marketUpdates}
            onValueChange={setMarketUpdates}
            disabled={!pushEnabled}
          />

          <NotificationRow
            title="Security alerts"
            subtitle="Important account and login notifications."
            value={securityAlerts}
            onValueChange={setSecurityAlerts}
            disabled={!pushEnabled}
            isLast
          />
        </View>
      </ScrollView>
    </View>
  );
}

function NotificationRow({
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  isLast = false,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder, disabled && styles.rowDisabled]}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={disabled ? false : value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#cbd7e2', true: '#9fb6cd' }}
        thumbColor={disabled ? '#b8c4d1' : value ? '#024883' : '#f4f4f4'}
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
    minHeight: 82,
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
  rowDisabled: {
    opacity: 0.45,
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