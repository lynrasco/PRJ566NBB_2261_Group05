import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { uploadImage, processImage, searchFromImage } from '@/services/api';

type ItemCondition = {
  label: string;
  conditionId: string;
};

const conditions: ItemCondition[] = [
  { label: 'New with tags', conditionId: '1000' },
  { label: 'New without tags', conditionId: '1500' },
  { label: 'New with imperfections', conditionId: '1750' },
  { label: 'Pre-owned – Excellent', conditionId: '2990' },
  { label: 'Pre-owned – Good', conditionId: '3000' },
  { label: 'Pre-owned – Fair', conditionId: '3010' },
];

export default function ItemConditionScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | null>(null);

  const imageSource = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/partial-react-logo.png');

  /*
  const continueToListings = () => {
    /*
    if (!selectedCondition) {
      return;
    }
    
    router.push({
      pathname: '/market-listings',
      params: {
        imageUri,
        condition: selectedCondition.label,
        conditionId: selectedCondition.conditionId,
      },
    });
    
  };
  */
  const continueToListings = async () => {
  if (!selectedCondition || !imageUri) return;

  try {
    // STEP 1: upload image → get imageId
    const imageId = await uploadImage(imageUri);

    // STEP 2: process image (AI)
    await processImage(imageId);

    // STEP 3: search eBay using imageId + conditionId
    const listings = await searchFromImage(
      imageId,
      selectedCondition.conditionId
    );

    router.push({
      pathname: '/market-listings',
      params: {
        listings: JSON.stringify(listings),
        imageUri,
        conditionId: selectedCondition.conditionId,
      },
    });

  } catch (err) {
    console.error('Flow error:', err);
  }
};



  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>FlipValue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.imageCard}>
        <Image source={imageSource} style={styles.itemImage} />
      </View>

      <Text style={styles.title}>Item condition</Text>
      <Text style={styles.subtitle}>Select the condition that best matches the item.</Text>

      <View style={styles.conditionList}>
        {conditions.map((condition) => {
          const isSelected = selectedCondition === condition;

          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={condition.conditionId}
              onPress={() => setSelectedCondition(condition)}
              style={[styles.conditionButton, isSelected && styles.conditionButtonSelected]}
            >
              <Text style={[styles.conditionText, isSelected && styles.conditionTextSelected]}>
                {condition.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        disabled={!selectedCondition}
        onPress={continueToListings}
        style={[styles.continueButton, !selectedCondition && styles.continueButtonDisabled]}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    lineHeight: 28,
    color: '#111111',
  },
  brand: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 21,
    color: '#050505',
  },
  headerSpacer: {
    width: 36,
  },
  imageCard: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#eeeeee',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 4,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 36,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 22,
    color: '#111111',
  },
  subtitle: {
    marginTop: 10,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
  },
  conditionList: {
    marginTop: 24,
    gap: 12,
  },
  conditionButton: {
    minHeight: 54,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
  },
  conditionButtonSelected: {
    borderColor: '#0d3b66',
    backgroundColor: '#e9f2fb',
  },
  conditionText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#111111',
  },
  conditionTextSelected: {
    color: '#0d3b66',
  },
  continueButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    borderRadius: 8,
    backgroundColor: '#0d3b66',
  },
  continueButtonDisabled: {
    backgroundColor: '#9aa8b5',
  },
  continueButtonText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },
});
