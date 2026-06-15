import { StyleSheet, View, Image, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './themed-text';

export type DashboardHeaderProps = ViewProps & {
  userName?: string;
  profileImage?: string;
};

export function DashboardHeader({ userName = 'Linda', profileImage, style, ...otherProps }: DashboardHeaderProps) {
  return (
    <LinearGradient
      colors={['#1e5089', '#0d3b66']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.headerContent} {...otherProps}>
        {profileImage && (
          <Image
            source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
            style={styles.profileImage}
          />
        )}
        <View style={styles.textSection}>
          <ThemedText type="title" style={styles.nameText}>
            Welcome, {userName}!
          </ThemedText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  greetingText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 0,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
});
