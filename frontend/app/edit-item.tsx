import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { useState } from 'react';

export default function EditItemScreen() {
  const [title, setTitle] = useState('Viable Black by SM');
  const [brand, setBrand] = useState('Steve Madden');
  const [category, setCategory] = useState('Footwear');
  const [description, setDescription] = useState(
    'Elegant black heels designed to provide both style and confidence. Featuring a sleek shape and comfortable fit, these heels are perfect for formal events, office wear, or a night out. The timeless black color ensures they complement any outfit effortlessly.'
  );
  const [price, setPrice] = useState(50);
  const [minPrice, setMinPrice] = useState(23);
  const [maxPrice, setMaxPrice] = useState(83);

  const imageSource = require('@/assets/images/partial-react-logo.png');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          <View style={styles.imageShadowContainer}>
            <View style={styles.imageContainer}>
              <Image source={imageSource} style={styles.image} />
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter product title"
            placeholderTextColor="#999"
          />
        </View>

        {/* Brand */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Brand:</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category:</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Enter category"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Price */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.priceDisplay}>$ {parseFloat(price.toFixed(2))}</Text>

          {/* Price Range Slider */}
          <View style={styles.priceRangeContainer}>
            <Text style={styles.priceRangeMin}>${parseFloat(minPrice.toFixed(2))}</Text>

            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={minPrice}
                maximumValue={maxPrice}
                value={price}
                onValueChange={setPrice}
                minimumTrackTintColor="#0d3b66"
                maximumTrackTintColor="#c0c0c0"
                thumbTintColor="#0d3b66"
              />
            </View>

            <Text style={styles.priceRangeMax}>${parseFloat(maxPrice.toFixed(2))}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#0d3b66',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  imageShadowContainer: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    default: {},
  }),
  imageContainer: Platform.select({
    web: {
      width: 220,
      height: 220,
      backgroundColor: '#e8e8e8',
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 10px 16px rgba(0, 0, 0, 0.25)',
    } as any,
    default: {
      width: 220,
      height: 220,
      backgroundColor: '#e8e8e8',
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }),
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 100,
  },
  priceDisplay: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  priceRangeMin: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    width: 30,
  },
  sliderWrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
  },
  priceRangeMax: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    width: 30,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: 20,
  },
});
