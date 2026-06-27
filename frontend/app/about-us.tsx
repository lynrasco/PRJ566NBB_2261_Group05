import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TEAM_MEMBERS = [
  'Joseph Fuh Che',
  'Aliyah Ighodaro',
  'Lyndsey Rasco',
  'Abigael Julao',
  'Sezim Duishenbieva',
];

export default function AboutUsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.iconPressed]}
          >
            <Ionicons name="arrow-back" size={22} color="#07111b" />
          </Pressable>
        </View>

        <Text style={styles.title}>About us</Text>

        <View style={styles.brandBlock}>
          <Image
            source={require('@/assets/images/flipvalue-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>FlipValue</Text>
          <Text style={styles.teamName}>by iSALAJ Inc</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our mission</Text>
          <Text style={styles.bodyText}>
            FlipValue helps resellers and thrifters make smarter pricing decisions by
            identifying item details and comparing them with similar resale listings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What we do</Text>
          <View style={styles.pointRow}>
            <Ionicons name="scan-outline" size={18} color="#024883" />
            <Text style={styles.pointText}>Recognize brands, styles, and materials.</Text>
          </View>
          <View style={styles.pointRow}>
            <Ionicons name="pricetag-outline" size={18} color="#024883" />
            <Text style={styles.pointText}>Suggest fair resale price ranges.</Text>
          </View>
          <View style={styles.pointRow}>
            <Ionicons name="trending-up-outline" size={18} color="#024883" />
            <Text style={styles.pointText}>Support better listings and fewer pricing mistakes.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project team</Text>
          {TEAM_MEMBERS.map((member) => (
            <Text key={member} style={styles.memberText}>
              {member}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    paddingTop: 73,
    paddingHorizontal: 32,
    paddingBottom: 64,
  },
  topBar: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
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
  title: {
    marginTop: 58,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 24,
    lineHeight: 31,
    color: '#050505',
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 34,
    borderRadius: 18,
    backgroundColor: '#eef3f8',
    paddingVertical: 24,
    paddingHorizontal: 18,
  },
  logo: {
    width: 74,
    height: 74,
  },
  brandName: {
    marginTop: 12,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 19,
    lineHeight: 25,
    color: '#024883',
  },
  teamName: {
    marginTop: 4,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#314760',
  },
  section: {
    marginTop: 27,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    lineHeight: 18,
    color: '#050505',
  },
  bodyText: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: '#314760',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 13,
  },
  pointText: {
    flex: 1,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#314760',
  },
  memberText: {
    marginBottom: 8,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#314760',
  },
});