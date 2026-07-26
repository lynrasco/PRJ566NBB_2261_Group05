import { StyleSheet, View, Image, TouchableOpacity, Pressable, type TouchableOpacityProps } from 'react-native';
import { ThemedText } from './themed-text';
import { useAppTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';

export type ListItemProps = TouchableOpacityProps & {
  image?: string;
  title: string;
  price: string;
  description?: string;
  onArrowPress?: () => void;
};

export function ListItem({
  image,
  title,
  price,
  description,
  onPress,
  onArrowPress,
  style,
  ...otherProps
}: ListItemProps) {
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, isDark && styles.containerDark, style]}
      {...otherProps}
    >
      <View style={styles.content}>
        {image && (
          <Image
            source={typeof image === 'string' ? { uri: image } : image}
            style={styles.image}
          />
        )}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <ThemedText type="defaultSemiBold" style={[styles.title, isDark && styles.textDark]}>
              {title}
            </ThemedText>
            {onArrowPress ? (
              <Pressable
                accessibilityLabel="Share to eBay"
                onPress={onArrowPress}
                hitSlop={10}
                style={[styles.shareButton, isDark && styles.shareButtonDark]}
              >
                <Ionicons
                  color={isDark ? '#8bbcff' : '#4f5d6b'}
                  name="share-social-outline"
                  size={18}
                />
              </Pressable>
            ) : (
              <View style={[styles.shareButton, isDark && styles.shareButtonDark]}>
                <Ionicons
                  color={isDark ? '#8bbcff' : '#4f5d6b'}
                  name="share-social-outline"
                  size={18}
                />
              </View>
            )}
          </View>
          {description && (
            <ThemedText style={[styles.description, isDark && styles.mutedTextDark]} numberOfLines={2}>
              {description}
            </ThemedText>
          )}
          <View style={styles.priceContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.price, isDark && styles.accentTextDark]}>
              {price}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  shareButton: {
    marginLeft: 8,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f2f5f8',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  priceContainer: {
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  accentTextDark: {
    color: '#8bbcff',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  shareButtonDark: {
    backgroundColor: 'rgba(139, 188, 255, 0.12)',
  },
  textDark: {
    color: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1d2d44',
    borderWidth: 1,
    borderColor: '#2d3a4a',
    shadowOpacity: 0.25,
  },
});
