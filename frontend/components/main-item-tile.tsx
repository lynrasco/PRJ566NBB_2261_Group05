import { StyleSheet, View, Image, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { ThemedText } from './themed-text';

export type MainItemTileProps = TouchableOpacityProps & {
  image?: string;
  title: string;
  brand?: string;
  priceRange?: string;
  description?: string;
};

export function MainItemTile({
  image,
  title,
  brand,
  priceRange,
  description,
  onPress,
  style,
  ...otherProps
}: MainItemTileProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
      {...otherProps}
    >
      <View style={styles.imageContainer}>
        {image && (
          <Image
            source={typeof image === 'string' ? { uri: image } : image}
            style={styles.image}
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleSection}>
          <View style={styles.titleWrapper}>
            <ThemedText type="defaultSemiBold" style={[styles.title, { color: '#1a1a1a' }]}>
              {title}
            </ThemedText>
            {brand && (
              <ThemedText style={styles.brand}>{brand}</ThemedText>
            )}
          </View>
          {priceRange && (
            <ThemedText type="defaultSemiBold" style={styles.priceRange}>
              {priceRange}
            </ThemedText>
          )}
        </View>

        {description && (
          <ThemedText style={styles.description} numberOfLines={3}>
            {description}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    backgroundColor: '#e8e8e8',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  titleWrapper: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  brand: {
    fontSize: 14,
    color: '#333',
  },
  priceRange: {
    fontSize: 16,
    color: '#0d3b66',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
