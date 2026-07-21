import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { useCallback, useState } from 'react';
import { getAllItems } from '@/services/api';
import { useTranslation } from '@/hooks/use-translation';
import { useProfile } from '@/context/profile-context';

const SETTINGS_OPTIONS = [
  { key: 'profileSettings', icon: 'person-outline' },
  { key: 'passwordSecurity', icon: 'lock-closed-outline' },
  { key: 'language', icon: 'language-outline' },
  { key: 'notifications', icon: 'notifications-outline' },
  { key: 'privacy', icon: 'shield-checkmark-outline' },
  { key: 'theme', icon: 'color-palette-outline' },
  { key: 'aboutUs', icon: 'information-circle-outline' },
] as const;

export default function SettingsScreen() {
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();
  const { profile, avatarSource } = useProfile();
  const [items, setItems] = useState<any[]>([]);
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    try {
      const response = await getAllItems();
      if (response.success && Array.isArray(response.items)) {
        setItems(response.items);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  };

  const signOut = () => {
    router.replace('/(auth)/login');
  };

  const openSetting = (option: string) => {
  if (option === 'profileSettings') {
    router.push('/profile-settings');
    return;
  }

  if (option === 'passwordSecurity') {
    router.push('/password-security');
    return;
  }

  if (option === 'language') {
    router.push('/languages');
    return;
  }

  if (option === 'notifications') {
    router.push('/notification-settings');
    return;
  }

  if (option === 'privacy') {
    router.push('/privacy-settings');
    return;
  }

  if (option === 'theme') {
    router.push('/theme-settings');
    return;
  }

  if (option === 'aboutUs') {
    router.push('/about-us');
  }
};

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.profileHeader, isDark && styles.profileHeaderDark]}>
          <Image
            source={avatarSource}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={[styles.meta, isDark && styles.metaDark]}>
            @{profile.username} · {items.length} {items.length === 1 ? 'item' : 'items'} valued
          </Text>
        </View>

        <View style={[styles.settingsCard, isDark && styles.settingsCardDark]}>
          {SETTINGS_OPTIONS.map((option, index) => {
            const isLast = index === SETTINGS_OPTIONS.length - 1;
            return (
            <Pressable
            key={option.key}
            onPress={() => openSetting(option.key)}
            style={({ pressed }) => [
              styles.settingsRow,
              isDark && styles.settingsRowDark,
              !isLast && styles.rowBorder,
              isDark && !isLast && styles.rowBorderDark,
              pressed && (isDark ? styles.rowPressedDark : styles.rowPressed),
            ]}>
            <View style={styles.rowLeft}>
               <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                <Ionicons name={option.icon} size={18} color={isDark ? '#8bbcff' : '#024883'} />
               </View>
                <Text style={[styles.rowText, isDark && styles.rowTextDark]}>
                  {t(option.key)}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#b8c4d1' : '#00213b'} />
          </Pressable>
          );
        })}
        </View>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [
            styles.signOutButton,
            isDark && styles.signOutButtonDark,
            pressed && (isDark ? styles.signOutPressedDark : styles.signOutPressed),
          ]}>
          <Text style={[styles.signOutText, isDark && styles.signOutTextDark]}>
            {t('signOut')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  content: {
    paddingBottom: 130,
  },
  profileHeader: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#024883',
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: '#9fb6cd',
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  name: {
    marginTop: 17,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 21,
    lineHeight: 27,
    color: '#ffffff',
    textAlign: 'center',
  },
  meta: {
    marginTop: 2,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    lineHeight: 17,
    color: '#d7e3ef',
    textAlign: 'center',
  },
  settingsCard: {
    marginTop: 18,
    marginHorizontal: 17,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  settingsRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd7e2',
  },
  rowPressed: {
    backgroundColor: '#f5f8fb',
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 14,
    lineHeight: 19,
    color: '#000715',
  },
  signOutButton: {
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginHorizontal: 17,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d7e0ea',
    backgroundColor: '#f7fafc',
  },
  signOutPressed: {
    backgroundColor: '#e8eef4',
  },
  signOutText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#024883',
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 17,
    backgroundColor: '#e9f2fb',
  },
  screenDark: {
    backgroundColor: '#08111f',
  },
  profileHeaderDark: {
    backgroundColor: '#10243a',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3a4a',
  },
  metaDark: {
    color: '#b8c4d1',
  },
  settingsCardDark: {
    backgroundColor: '#121c2b',
    borderWidth: 1,
    borderColor: '#2d3a4a',
  },
  settingsRowDark: {
    backgroundColor: '#121c2b',
  },
  rowBorderDark: {
    borderBottomColor: '#2d3a4a',
  },
  rowPressedDark: {
    backgroundColor: '#1d2d44',
  },
  rowTextDark: {
    color: '#ffffff',
  },
  iconCircleDark: {
    backgroundColor: 'rgba(139, 188, 255, 0.12)',
  },
  signOutButtonDark: {
    backgroundColor: '#121c2b',
    borderColor: '#2d3a4a',
  },
  signOutPressedDark: {
    backgroundColor: '#1d2d44',
  },
  signOutTextDark: {
    color: '#8bbcff',
  },
});
