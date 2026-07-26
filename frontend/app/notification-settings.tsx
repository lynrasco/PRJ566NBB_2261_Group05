import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '@/context/theme-context';
import { useProfile } from '@/context/profile-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  getNotificationSettings,
  sendTestNotification,
  updateNotificationSettings,
} from '@/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      'EAS project ID was not found. The Expo project must be linked to EAS first.'
    );
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token.data;
}

export default function NotificationSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { profile } = useProfile();
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  useEffect(() => {
  const loadNotificationSettings = async () => {
    if (!profile.userId) return;

    try {
      const response =
        await getNotificationSettings(profile.userId);

      if (response.notificationSettings) {
        setPushEnabled(
          response.notificationSettings.pushEnabled
        );
        setPriceAlerts(
          response.notificationSettings.priceAlerts
        );
        setMarketUpdates(
          response.notificationSettings.marketUpdates
        );
        setSecurityAlerts(
          response.notificationSettings.securityAlerts
        );
      }

      setExpoPushToken(response.expoPushToken || null);
    } catch (error) {
      console.error(
        'Failed to load notification settings:',
        error
      );
    }
  };

  loadNotificationSettings();
}, [profile.userId]);

const saveSettings = async (
  settings: {
    pushEnabled: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
    securityAlerts: boolean;
  },
  token: string | null | undefined = expoPushToken
) => {
  if (!profile.userId) {
    Alert.alert(
      'Error',
      'Please log in again before changing notification settings.'
    );
    return;
  }

  await updateNotificationSettings(
    profile.userId,
    settings,
    token
  );
};

const handlePushEnabledChange = async (enabled: boolean) => {
  setLoading(true);

  try {
    let token = expoPushToken;

    if (enabled) {
      token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    } else {
      token = null;
      setExpoPushToken(null);
    }

    const settings = {
      pushEnabled: enabled,
      priceAlerts,
      marketUpdates,
      securityAlerts,
    };

    setPushEnabled(enabled);

    await saveSettings(settings, token);
  } catch (error: any) {
    console.error(error);

    Alert.alert(
      'Push Notifications',
      error?.message ||
        'Unable to enable push notifications.'
    );
  } finally {
    setLoading(false);
  }
};

const handlePriceAlertsChange = async (value: boolean) => {
  setPriceAlerts(value);

  try {
    await saveSettings({
      pushEnabled,
      priceAlerts: value,
      marketUpdates,
      securityAlerts,
    });
  } catch (error) {
    console.error('Failed to save price alerts:', error);
  }
};

const handleMarketUpdatesChange = async (value: boolean) => {
  setMarketUpdates(value);

  try {
    await saveSettings({
      pushEnabled,
      priceAlerts,
      marketUpdates: value,
      securityAlerts,
    });
  } catch (error) {
    console.error('Failed to save market updates:', error);
  }
};

const handleSecurityAlertsChange = async (value: boolean) => {
  setSecurityAlerts(value);

  try {
    await saveSettings({
      pushEnabled,
      priceAlerts,
      marketUpdates,
      securityAlerts: value,
    });
  } catch (error) {
    console.error('Failed to save security alerts:', error);
  }
};

const handleTestNotification = async () => {
  if (!profile.userId) {
    Alert.alert('Error', 'Please log in again.');
    return;
  }

  if (!pushEnabled) {
    Alert.alert(
      'Push Notifications',
      'Enable push notifications first.'
    );
    return;
  }

  if (!expoPushToken) {
    Alert.alert(
      'Push Notifications',
      'No push notification token is registered yet.'
    );
    return;
  }

  setLoading(true);

  try {
    await sendTestNotification(profile.userId);

    Alert.alert(
      'Test Notification',
      'Test notification was sent.'
    );
  } catch (error: any) {
    console.error('Failed to send test notification:', error);

    Alert.alert(
      'Test Notification',
      error?.response?.data?.message ||
        'Unable to send test notification.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#ffffff' : '#111111'}/>
          </Pressable>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {t('notifications')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.previewCard, isDark && styles.cardDark]}>
          <View style={[styles.iconCircle, isDark && styles.iconCircleDark, ]}>
            <Ionicons name="notifications-outline" size={30} color={isDark ? '#8bbcff' : '#024883'}/>
          </View>
          <Text style={[styles.previewTitle, isDark && styles.textDark]}>
            {t('getNotifs')}
          </Text>
          <Text style={[styles.previewText, isDark && styles.mutedTextDark]}>
            {t('notifDesc')}
          </Text>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <NotificationRow
            title={t('notifTitle1')}
            subtitle={t('notifSubtitle1')}
            value={pushEnabled}
            onValueChange={handlePushEnabledChange}
            isDark={isDark}
          />

          <NotificationRow
            title={t('notifTitle2')}
            subtitle={t('notifSubtitle2')}
            value={priceAlerts}
            onValueChange={handlePriceAlertsChange}
            disabled={!pushEnabled}
            isDark={isDark}
          />

          <NotificationRow
            title={t('notifTitle3')}
            subtitle={t('notifSubtitle3')}
            value={marketUpdates}
            onValueChange={handleMarketUpdatesChange}
            disabled={!pushEnabled}
            isDark={isDark}
          />

          <NotificationRow
            title={t('notifTitle4')}
            subtitle={t('notifSubtitle4')}
            value={securityAlerts}
            onValueChange={handleSecurityAlertsChange}
            disabled={!pushEnabled}
            isLast
            isDark={isDark}
          />
        </View>
        <Pressable
          onPress={handleTestNotification}
          disabled={loading || !pushEnabled}
          style={[
            styles.testButton,
            (loading || !pushEnabled) && styles.testButtonDisabled,
          ]}
        >
          <Text style={styles.testButtonText}>
            {loading ? 'Please wait...' : 'Send Test Notification'}
          </Text>
        </Pressable>
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
  isDark,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
  isDark: boolean;
}) {
  return (
    <View style={[styles.row, isDark && styles.rowDark, !isLast && styles.rowBorder, disabled && styles.rowDisabled, ]}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, isDark && styles.textDark]}>{title}</Text>
        <Text style={[styles.rowSubtitle, isDark && styles.mutedTextDark]}>{subtitle}</Text>
      </View>

      <Switch
        value={disabled ? false : value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: isDark ? '#3b4d61' : '#cbd7e2',
          true: '#9fb6cd',
        }}
        thumbColor={
          disabled
          ? '#b8c4d1'
          : value
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
  screenDark: {
    backgroundColor: '#08111f',
  },
  cardDark: {
    backgroundColor: '#121c2b',
  },
  rowDark: {
    backgroundColor: '#121c2b',
  },
  textDark: {
    color: '#ffffff',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  iconCircleDark: {
    backgroundColor: '#1d2d44',
  },

  testButton: {
  marginTop: 18,
  height: 48,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#024883',
},

testButtonDisabled: {
  opacity: 0.5,
},

testButtonText: {
  fontFamily: 'AzeretMono_700Bold',
  fontSize: 12,
  color: '#ffffff',
},
});