import { StyleSheet, View, Image, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { ThemedText } from './themed-text';

export type ListItemProps = TouchableOpacityProps & {
  image?: string;
  title: string;
  price: string;
  description?: string;
};

export function ListItem({
  image,
  title,
  price,
  description,
  onPress,
  style,
  ...otherProps
}: ListItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
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
            <ThemedText type="defaultSemiBold" style={[styles.title, { color: '#1a1a1a' }]}>
              {title}
            </ThemedText>
            <View style={styles.arrowButton}>
              <ThemedText style={styles.arrow}>→</ThemedText>
            </View>
          </View>
          {description && (
            <ThemedText style={styles.description} numberOfLines={2}>
              {description}
            </ThemedText>
          )}
          <View style={styles.priceContainer}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
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
  arrowButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
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
});
