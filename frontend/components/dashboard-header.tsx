import { StyleSheet, View, Image, ViewProps, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

export type DashboardHeaderProps = ViewProps & {
  userName?: string;
  //profileImage?: string;
  profileImage?: ImageSourcePropType;
  totalEstimatedValue?: string;
  trendValue?: string;
};

export function DashboardHeader({
  userName = 'Linda',
  profileImage,
  totalEstimatedValue = '$0',
  trendValue = '+12%',
  style,
  ...otherProps
}: DashboardHeaderProps) {
  return (
    <LinearGradient
      colors={['#07375f', '#044c84']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.headerContent} {...otherProps}>
        <View style={styles.topRow}>
          <View style={styles.textSection}>
            <ThemedText style={styles.greetingText}>Welcome back,</ThemedText>
            <View style={styles.nameRow}>
              <ThemedText type="title" style={styles.nameText}>
                {userName}
              </ThemedText>
              <ThemedText style={styles.waveText}>👋</ThemedText>
            </View>
          </View>

          {profileImage && (
            <Image
              source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
              style={styles.profileImage}
            />
          )}
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueTextGroup}>
            <ThemedText style={styles.valueLabel} numberOfLines={1} adjustsFontSizeToFit>
              Total estimated value
            </ThemedText>
            <ThemedText type="title" style={styles.valueAmount} numberOfLines={1} adjustsFontSizeToFit>
              {totalEstimatedValue}
            </ThemedText>
          </View>

          <View style={styles.trendPill}>
            <Ionicons name="trending-up" size={17} color="#78e6b4" />
            <ThemedText type="defaultSemiBold" style={styles.trendText}>
              {trendValue}
            </ThemedText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 34,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: 'stretch',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    gap: 22,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  textSection: {
    alignItems: 'flex-start',
    flex: 1,
  },
  greetingText: {
    color: '#d2d9e6',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'AzeretMono_700Bold',
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  nameText: {
    color: '#ffffff',
    fontSize: 29,
    lineHeight: 34,
  },
  waveText: {
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 30,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  valueCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(98, 142, 184, 0.48)',
    borderColor: 'rgba(189, 213, 238, 0.28)',
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 96,
    paddingHorizontal: 24,
    paddingVertical: 18,
    width: '100%',
  },
  valueTextGroup: {
    flex: 1,
    minWidth: 0,
    paddingRight: 16,
  },
  valueLabel: {
    color: '#edf2fb',
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  valueAmount: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 42,
    marginTop: 2,
  },
  trendPill: {
    alignItems: 'center',
    backgroundColor: '#052947',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  trendText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 18,
  },
});
