import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LanguagesScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <Pressable
        hitSlop={12}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={24} color="#111111" />
      </Pressable>

      <Text selectable style={styles.title}>
        Languages
      </Text>

      <View style={styles.previewCard}>
        <View style={styles.iconCircle}>
            <Ionicons name="language-outline" size={28} color="#024883" />
        </View>
        <Text style={styles.previewTitle}>App language</Text>
        <Text style={styles.previewText}>
            Choose the language used throughout the app.
        </Text>
      </View>

      <Pressable style={({ pressed }) => [styles.optionCard, pressed && styles.cardPressed]}>
        <Text selectable style={styles.optionLabel}>
          App Language
        </Text>
        <View style={styles.optionValueGroup}>
          <Text selectable style={styles.optionValue}>
            English
          </Text>
          <Ionicons name="chevron-forward" size={22} color="#111111" />
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  content: {
    flexGrow: 1,
    paddingTop: 78,
    paddingHorizontal: 17,
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
    marginTop: 72,
    textAlign: 'center',
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 28,
    lineHeight: 35,
    color: '#050505',
  },
  optionCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 43,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingLeft: 31,
    paddingRight: 17,
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)',
  },
  cardPressed: {
    backgroundColor: '#eeeeee',
  },
  optionLabel: {
    flex: 1,
    paddingRight: 16,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#050505',
  },
  optionValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  optionValue: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 15,
    color: '#111111',
  },
  previewCard: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.12)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#e9f2fb',
  },
  previewTitle: {
    marginTop: 10,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    color: '#111111',
  },
  previewText: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#52616f',
  },
});