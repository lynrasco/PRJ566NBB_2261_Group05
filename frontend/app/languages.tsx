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
    backgroundColor: '#ffffff',
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
    borderRadius: 14,
    backgroundColor: '#f6f6f6',
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
});