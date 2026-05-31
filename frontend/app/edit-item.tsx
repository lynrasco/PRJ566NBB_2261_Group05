import { router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';

export default function EditItemScreen() {
  const params = useLocalSearchParams<{
    itemId?: string;
    title?: string;
    brand?: string;
    category?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
  }>();

  const [title, setTitle] = useState(params.title || 'Viable Black by SM');
  const [brand, setBrand] = useState(params.brand || 'Steve Madden');
  const [category, setCategory] = useState(params.category || 'Footwear');
  const [description, setDescription] = useState(
    params.description || 'Elegant black heels designed to provide both style and confidence. Featuring a sleek shape and comfortable fit, these heels are perfect for formal events, office wear, or a night out. The timeless black color ensures they complement any outfit effortlessly.'
  );
  const [price, setPrice] = useState(parseFloat(params.price || '50'));
  const parsedPrice = parseFloat(params.price || '50');
  const [minPrice, setMinPrice] = useState(Math.max(5, Math.floor(parsedPrice * 0.5)));
  const [maxPrice, setMaxPrice] = useState(Math.ceil(parsedPrice * 1.5));

  const imageSource = params.imageUrl
    ? { uri: params.imageUrl }
    : require('@/assets/images/partial-react-logo.png');

  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionRef = useRef<TextInput>(null);

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      descriptionRef.current?.measure((fx, fy, width, height, px, py) => {
        scrollViewRef.current?.scrollTo({
          y: py - 200,
          animated: true,
        });
      });
    }, 100);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
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
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
        style={{ backgroundColor: '#fff' }}
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
          <ThemedText type="defaultSemiBold" style={{color: '#000'}}>Title:</ThemedText>
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
          <ThemedText type="defaultSemiBold" style={{color: '#000'}}>Brand:</ThemedText>
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
          <ThemedText type="defaultSemiBold" style={{color: '#000'}}>Category:</ThemedText>
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
          <ThemedText type="defaultSemiBold" style={{color: '#000'}}>Description:</ThemedText>
          <TextInput
            ref={descriptionRef}
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            onFocus={handleDescriptionFocus}
          />
        </View>

        {/* Price */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={{color: '#000'}}>Price:</ThemedText>
          <Text style={styles.priceDisplay}>${parseFloat(price.toFixed(2))}</Text>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formLabel: {
    color: "#000",
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 35,
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
    //fontWeight: '600',
    fontFamily: "AzeretMono_400Regular",
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    flexGrow: 1,
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
    resizeMode: 'contain',
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
    fontFamily: "AzeretMono_400Regular",
  },
  descriptionInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 100,
  },
  priceDisplay: {
    fontSize: 30,
    //fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    fontFamily: "AzeretMono_700Bold",
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  priceRangeMin: {
    fontSize: 14,
    //fontWeight: '600',
    fontFamily: "AzeretMono_700Bold",
    color: '#000',
    width: 45,
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
    fontSize: 14,
    //fontWeight: '600',
    fontFamily: "AzeretMono_700Bold",
    color: '#000',
    width: 45,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: 20,
  },
});