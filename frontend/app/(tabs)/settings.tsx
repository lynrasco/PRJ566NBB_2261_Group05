import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/*
const SETTINGS_OPTIONS = [
  'Profile settings',
  'Password & security',
  'Languages',
  'Notifications',
  'Privacy',
  'Theme',
  'About us',
];
*/
const SETTINGS_OPTIONS = [
  { label: 'Profile settings', icon: 'person-outline' },
  { label: 'Password & security', icon: 'lock-closed-outline' },
  { label: 'Languages', icon: 'language-outline' },
  { label: 'Notifications', icon: 'notifications-outline' },
  { label: 'Privacy', icon: 'shield-checkmark-outline' },
  { label: 'Theme', icon: 'color-palette-outline' },
  { label: 'About us', icon: 'information-circle-outline' },
] as const;

export default function SettingsScreen() {
  const signOut = () => {
    router.replace('/(auth)/login');
  };

  const openSetting = (option: string) => {
    if (option === 'Profile settings') {
      router.push('/profile-settings');
      return;
    }

    if (option === 'Password & security') {
      router.push('/password-security');
      return;
    }

    if (option === 'Languages') {
      router.push('/languages');
      return;
    }

    if (option === 'Notifications') {
      router.push('/notification-settings');
      return;
    }

    if (option === 'Privacy') {
      router.push('/privacy-settings');
      return;
    }

    if (option === 'Theme') {
      router.push('/theme-settings');
      return;
    }

    if (option === 'About us') {
      router.push('/about-us');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileHeader}>
          <Image
            source={require('@/assets/images/profile-picture.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>Linda Carter</Text>
          <Text style={styles.meta}>@lindaflips · 5 items valued</Text>
        </View>

        <View style={styles.settingsCard}>
          {SETTINGS_OPTIONS.map((option, index) => {
            const isLast = index === SETTINGS_OPTIONS.length - 1;
            return (
            <Pressable
            key={option.label}
            onPress={() => openSetting(option.label)}
            style={({ pressed }) => [
              styles.settingsRow,
              !isLast && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}>
            <View style={styles.rowLeft}>
               <View style={styles.iconCircle}>
                <Ionicons name={option.icon} size={18} color="#024883" />
              </View>
                <Text style={styles.rowText}>{option.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#00213b" />
          </Pressable>
          );
        })}
        </View>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutPressed]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
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
});