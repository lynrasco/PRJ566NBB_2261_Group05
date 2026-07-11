import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppTheme } from '@/context/theme-context';

const PROFILE_FIELDS = [
  { key: 'username', label: 'Username:' },
  { key: 'name', label: 'Name:' },
  { key: 'phone', label: 'Phone:' },
  { key: 'email', label: 'Email:' },
] as const;

type ProfileField = (typeof PROFILE_FIELDS)[number]['key'];

export default function ProfileSettingsScreen() {
  const [profile, setProfile] = useState<Record<ProfileField, string>>({
    username: '',
    name: '',
    phone: '',
    email: '',
  });

  const updateField = (field: ProfileField, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = () => {
    router.back();
  };
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      style={[styles.screen, isDark && styles.screenDark]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          isDark && styles.contentDark,
        ]}
        >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.iconPressed]}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#ffffff' : '#07111b'}/>
          </Pressable>

          <Pressable
            onPress={saveProfile}
            style={({ pressed }) => [styles.saveButton, isDark && styles.saveButtonDark, pressed && styles.savePressed,]}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <Text style={[styles.title, isDark && styles.textDark]}>Profile Settings</Text>

        <View style={[styles.previewCard, isDark && styles.cardDark]}>
            <View style={[styles.iconCircle, isDark && styles.iconCircleDark,]}>
                <Ionicons name="person-outline" size={28} color={isDark ? '#8bbcff' : '#024883'} />
            </View>
            <Text style={[styles.previewTitle, isDark && styles.textDark,]}>Profile</Text>
            <Text style={[styles.previewText, isDark && styles.mutedTextDark,]}>
                Update your personal information.
            </Text>
        </View>

        <View style={styles.form}>
          {PROFILE_FIELDS.map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={[styles.label, isDark && styles.textDark,]}>{field.label}</Text>
              <TextInput
                value={profile[field.key]}
                onChangeText={(value) => updateField(field.key, value)}
                autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                autoCorrect={false}
                keyboardType={
                  field.key === 'phone'
                    ? 'phone-pad'
                    : field.key === 'email'
                      ? 'email-address'
                      : 'default'
                }
                textContentType={field.key === 'email' ? 'emailAddress' : 'none'}
                style={[styles.input, isDark && styles.inputDark,]}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  content: {
    flexGrow: 1,
    paddingTop: 73,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  topBar: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconPressed: {
    backgroundColor: '#eef3f8',
  },
  saveButton: {
    minWidth: 54,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#024883',
    paddingHorizontal: 13,
  },
  savePressed: {
    backgroundColor: '#002f59',
  },
  saveText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    lineHeight: 14,
    color: '#ffffff',
  },
  title: {
    marginTop: 68,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 24,
    lineHeight: 31,
    color: '#050505',
  },
  form: {
    marginTop: 55,
    paddingHorizontal: 13,
  },
  fieldGroup: {
    marginBottom: 17,
  },
  label: {
    marginBottom: 6,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 10,
    lineHeight: 14,
    color: '#060606',
  },
  input: {
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 13,
    color: '#050505',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
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
  screenDark: {
    backgroundColor: '#08111f',
  },
  contentDark: {
    backgroundColor: '#08111f',
  },
  cardDark: {
    backgroundColor: '#121c2b',
  },
  inputDark: {
    backgroundColor: '#1d2d44',
    color: '#ffffff',
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
  saveButtonDark: {
    backgroundColor: '#1f6fb2',
  },
});
