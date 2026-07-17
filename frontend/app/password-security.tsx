import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { useTranslation } from '@/hooks/use-translation';

export default function PasswordSecurityScreen() {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      style={[styles.screen, isDark && styles.screenDark]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, isDark && styles.contentDark,]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#ffffff' : '#111111'}/>
          </Pressable>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {t('passwordSecurity')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.previewCard, isDark && styles.cardDark]}>
            <View style={[styles.iconCircle, isDark && styles.iconCircleDark,]}>
                <Ionicons name="lock-closed-outline" size={28} color={isDark ? '#8bbcff' : '#024883'}/>
            </View>
            <Text style={[styles.previewTitle, isDark && styles.textDark,]}>
              {t('security')}
            </Text>
            <Text style={[styles.previewText, isDark && styles.mutedTextDark,]}>
                {t('securityDesc')}
            </Text>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={[styles.row, styles.rowBorder, isDark && styles.rowDark,]}>
            <Text selectable style={[styles.label, isDark && styles.textDark,]}>
              {t('oldPassword')}:
            </Text>
            <TextInput
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, isDark && styles.inputDark,]}
            />
          </View>

          <View style={[styles.row, isDark && styles.rowDark]}>
            <Text selectable style={[styles.label, isDark && styles.textDark,]}>
              {t('changePassword')}:
            </Text>
            <TextInput
              secureTextEntry
              textContentType="newPassword"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, isDark && styles.inputDark,]}
            />
          </View>
        </View>

        <View style={[styles.faceIdCard, isDark && styles.cardDark,]}>
          <Text selectable style={[styles.faceIdText, isDark && styles.textDark,]}>
            {t('enableFaceId')}
          </Text>
          <View style={styles.switchWrapper}>
            <Switch
            value={faceIdEnabled}
            onValueChange={setFaceIdEnabled}
            trackColor={{
              false: isDark ? '#3b4d61' : '#d9d9d9',
              true: '#34c759',
            }}
            thumbColor={isDark ? '#d9e2ec' : '#ffffff'}
            ios_backgroundColor={isDark ? '#3b4d61' : '#d9d9d9'}
            />
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        >
          <Text style={styles.saveText}>
            {t('save')}
          </Text>
        </Pressable>
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
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  /*
  backButton: {
    width: 45,
    height: 31,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 8,
  },
  */
  pressed: {
    opacity: 0.55,
  },
  /*
  title: {
    marginTop: 71,
    marginLeft: 13,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 28,
    lineHeight: 35,
    color: '#050505',
  },
  */
  title: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 21,
    color: '#111111',
  },
  form: {
    marginTop: 51,
    paddingHorizontal: 9,
  },
  fieldGroup: {
    marginBottom: 17,
  },
  label: {
    marginBottom: 7,
    marginLeft: 7,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    lineHeight: 17,
    color: '#050505',
  },
  input: {
    marginTop: 8,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f5f7',
    paddingHorizontal: 12,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 13,
    color: '#111111',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)'
  },
  faceIdCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 58,
    marginHorizontal: 9,
    borderRadius: 16,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  faceIdText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#050505',
  },
  saveButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginHorizontal: 9,
    borderRadius: 26,
    backgroundColor: '#024883',
  },
  saveButtonPressed: {
    backgroundColor: '#002f59',
  },
  saveText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  switchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#f3f5f7',
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
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 22,
},

headerSpacer: {
  width: 36,
},

backButton: {
  width: 36,
  height: 36,
  justifyContent: 'center',
},

card: {
  overflow: 'hidden',
  borderRadius: 18,
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 3px rgba(0,0,0,0.12)',
},

row: {
  paddingHorizontal: 18,
  paddingVertical: 16,
},

rowBorder: {
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#d7e0ea',
},

rowDark: {
  backgroundColor: '#121c2b',
},
});