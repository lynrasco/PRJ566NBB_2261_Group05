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

export default function PasswordSecurityScreen() {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </Pressable>

        <Text selectable style={styles.title}>
          Password & Security
        </Text>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text selectable style={styles.label}>
              Old Password:
            </Text>
            <TextInput
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text selectable style={styles.label}>
              Change Password:
            </Text>
            <TextInput
              secureTextEntry
              textContentType="newPassword"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.faceIdCard}>
          <Text selectable style={styles.faceIdText}>
            Add face-id
          </Text>
          <Switch
            onValueChange={setFaceIdEnabled}
            thumbColor="#ffffff"
            trackColor={{ false: '#d9d9d9', true: '#34c759' }}
            value={faceIdEnabled}
          />
        </View>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    paddingTop: 78,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  backButton: {
    width: 45,
    height: 31,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.55,
  },
  title: {
    marginTop: 71,
    marginLeft: 13,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 28,
    lineHeight: 35,
    color: '#050505',
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
    height: 50,
    borderRadius: 9,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 15,
    color: '#050505',
  },
  faceIdCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 58,
    borderRadius: 16,
    backgroundColor: '#f7f7f7',
    paddingLeft: 15,
    paddingRight: 38,
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.14)',
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
});