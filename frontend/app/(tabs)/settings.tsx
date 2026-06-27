import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const SETTINGS_OPTIONS = [
  'Profile settings',
  'Password & security',
  'Languages',
  'Notifications',
  'Privacy',
  'About us',
];

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
                key={option}
                onPress={() => openSetting(option)}
                style={({ pressed }) => [
                  styles.settingsRow,
                  !isLast && styles.rowBorder,
                  pressed && styles.rowPressed,
                ]}
              >
                <Text style={styles.rowText}>{option}</Text>
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
    minHeight: 49,
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
});
