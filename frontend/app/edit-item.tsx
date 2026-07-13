import { router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/theme-context';

export default function EditItemScreen() {
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const params = useLocalSearchParams<{
    itemId?: string;
    title?: string;
    brand?: string;
    category?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
  }>();

  /*
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
  */
  const initialPrice = Number.isFinite(Number(params.price))
  ? Number(params.price)
  : 0;

  const [title, setTitle] = useState(params.title || '');
  const [brand, setBrand] = useState(params.brand || '');
  const [category, setCategory] = useState(params.category || '');
  const [description, setDescription] = useState(params.description || '');
  const [price, setPrice] = useState(initialPrice);
  const [minPrice, setMinPrice] = useState(
    initialPrice > 0 ? Math.max(5, Math.floor(initialPrice * 0.5)) : 0
  );
  const [maxPrice, setMaxPrice] = useState(
    initialPrice > 0 ? Math.ceil(initialPrice * 1.5) : 100
  );
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
  if (!params.itemId) {
    Alert.alert('Error', 'Item ID is missing.');
    return;
  }

  try {
    setSaving(true);

    const response = await fetch(`http://localhost:3000/api/items/${params.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        category,
        brand,
        price,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update item.');
    }

    Alert.alert('Success', 'Item updated successfully.');
    router.back();
  } catch (error) {
    Alert.alert(
      'Error',
      error instanceof Error ? error.message : 'Something went wrong.'
    );
  } finally {
    setSaving(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark,]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backIcon, isDark && styles.textDark,]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

      </View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, isDark && styles.scrollViewDark,]}
        contentContainerStyle={[styles.contentContainer, isDark && styles.contentContainerDark,]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          <View style={styles.imageShadowContainer}>
            <View style={[styles.imageContainer, isDark && styles.imageContainerDark,]}>
              <Image source={imageSource} style={styles.image} />
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={[styles.fieldLabel, isDark && styles.textDark,]}>Title:</ThemedText>
          <TextInput
            style={[styles.input, isDark && styles.inputDark,]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter product title"
            placeholderTextColor={isDark ? '#7e90a4' : '#999'}
          />
        </View>

        {/* Brand */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={[styles.fieldLabel, isDark && styles.textDark,]}>Brand:</ThemedText>
          <TextInput
            style={[styles.input, isDark && styles.inputDark,]}
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand name"
            placeholderTextColor={isDark ? '#7e90a4' : '#999'}
          />
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={[styles.fieldLabel, isDark && styles.textDark,]}>Category:</ThemedText>
          <TextInput
            style={[styles.input, isDark && styles.inputDark,]}
            value={category}
            onChangeText={setCategory}
            placeholder="Enter category"
            placeholderTextColor={isDark ? '#7e90a4' : '#999'}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={[styles.fieldLabel, isDark && styles.textDark,]}>Description:</ThemedText>
          <TextInput
            ref={descriptionRef}
            style={[styles.input, isDark && styles.inputDark,]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            placeholderTextColor={isDark ? '#7e90a4' : '#999'}
            multiline
            numberOfLines={5}
            onFocus={handleDescriptionFocus}
          />
        </View>

        {/* Price */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={[styles.fieldLabel, isDark && styles.textDark,]}>Price:</ThemedText>
          <Text style={[styles.priceDisplay, isDark && styles.accentTextDark,]}>${parseFloat(price.toFixed(2))}</Text>

          {/* Price Range Slider */}
          <View style={styles.priceRangeContainer}>
            <Text style={[styles.priceRangeMin, isDark && styles.mutedTextDark,]}>${parseFloat(minPrice.toFixed(2))}</Text>

            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={minPrice}
                maximumValue={maxPrice}
                value={price}
                onValueChange={setPrice}
                minimumTrackTintColor={isDark ? '#8bbcff' : '#0d3b66'}
                maximumTrackTintColor={isDark ? '#2d3a4a' : '#c0c0c0'}
                thumbTintColor={isDark ? '#8bbcff' : '#0d3b66'}
              />
            </View>

            <Text style={[styles.priceRangeMax, isDark && styles.mutedTextDark,]}>${parseFloat(maxPrice.toFixed(2))}</Text>
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
  scrollView: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#08111f',
  },
  scrollViewDark: {
    backgroundColor: '#08111f',
  },
  contentContainerDark: {
    backgroundColor: '#08111f',
  },
  fieldLabel: {
    color: '#000',
  },
  textDark: {
    color: '#ffffff',
  },
  imageContainerDark: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2d3a4a',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  accentTextDark: {
    color: '#8bbcff',
  },
  inputDark: {
    backgroundColor: '#121c2b',
    borderColor: '#2d3a4a',
    borderWidth: 1,
    color: '#ffffff',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});