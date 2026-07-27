import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { BackHandler, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { uploadImage, processImage, searchFromImage } from '@/services/api';
import AnalysisLoadingScreen, { type AnalysisStep } from '@/components/analysis-loading-screen';
import { useAppTheme } from '@/context/theme-context';
import { useTranslation } from '@/hooks/use-translation';

type ItemCondition = {
  label: string;
  conditionId: string;
};

/*
const conditions: ItemCondition[] = [
  { label: 'New with tags', conditionId: '1000' },
  { label: 'New without tags', conditionId: '1500' },
  { label: 'New with imperfections', conditionId: '1750' },
  { label: 'Pre-owned – Excellent', conditionId: '2990' },
  { label: 'Pre-owned – Good', conditionId: '3000' },
  { label: 'Pre-owned – Fair', conditionId: '3010' },
];
*/
const conditions = [
  { label: 'newWithTags', conditionId: '1000' },
  { label: 'newWithoutTags', conditionId: '1500' },
  { label: 'newWithImperfections', conditionId: '1750' },
  { label: 'preOwnedExcellent', conditionId: '2990' },
  { label: 'preOwnedGood', conditionId: '3000' },
  { label: 'preOwnedFair', conditionId: '3010' },
];

export default function ItemConditionScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const navigation = useNavigation();
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('scanning');
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  const imageSource = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/partial-react-logo.png');

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isLoading });
  }, [isLoading, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        return;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => {
        subscription.remove();
      };
    }, [isLoading])
  );

  const continueToListings = async () => {
    if (!selectedCondition || !imageUri) return;

    setIsLoading(true);
    setLoadingProgress(0);

    try {
      // Step 1: Scanning
      setCurrentStep('scanning');
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoadingProgress(20);

      // Step 2: Identifying
      setCurrentStep('identifying');
      const imageData = await uploadImage(imageUri);
      setLoadingProgress(35);

      // Step 3: Searching
      setCurrentStep('searching');
      const processedImage = await processImage(imageData);
      setLoadingProgress(50);

      // Step 4: Comparing
      setCurrentStep('comparing');
      setLoadingProgress(75);
      const listings = await searchFromImage(
        processedImage || imageData,
        selectedCondition.conditionId
      );
      setLoadingProgress(90);

      // Step 5: Calculating
      setCurrentStep('calculating');
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoadingProgress(100);

      router.replace({
        pathname: '/item-result',
        params: {
          listings: JSON.stringify(listings),
          imageUri,
          //condition: selectedCondition.label,
          condition: t(selectedCondition.label),
          conditionId: selectedCondition.conditionId,
        },
      });
    } catch (err) {
      console.error('Flow error:', err);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  if (isLoading) {
    return <AnalysisLoadingScreen progress={loadingProgress} currentStep={currentStep} />;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, isDark && styles.contentContainerDark,]}
      showsVerticalScrollIndicator={false}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel={t('goBack')}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backIcon, isDark && styles.textDark]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text style={[styles.brand, isDark && styles.textDark]}>FlipValue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.imageCard, isDark && styles.imageCardDark,]}>
        <Image source={imageSource} style={styles.itemImage} />
      </View>

      <Text style={[styles.title, isDark && styles.textDark]}>
        {t('itemCondition')}
      </Text>
      <Text style={[styles.subtitle, isDark && styles.mutedTextDark,]}>
        {t('selectCondition')}
      </Text>
      <View style={styles.conditionList}>
        {conditions.map((condition) => {
          const isSelected = selectedCondition === condition;

          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={condition.conditionId}
              onPress={() => setSelectedCondition(condition)}
              style={[styles.conditionButton,
                isDark && styles.conditionButtonDark,
                isSelected && styles.conditionButtonSelected,
                isDark && isSelected && styles.conditionButtonSelectedDark,
              ]}
            >
              <Text style={[styles.conditionText, isDark && styles.textDark, isSelected && styles.conditionTextSelected, isDark && isSelected && styles.conditionTextSelectedDark,]}>
                {t(condition.label)}
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
        <Text style={styles.continueButtonText}>
          {t('continue')}
        </Text>
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
  containerDark: {
    backgroundColor: '#08111f',
  },
  contentContainerDark: {
    backgroundColor: '#08111f',
  },
  imageCardDark: {
    backgroundColor: '#121c2b',
  },
  conditionButtonDark: {
    backgroundColor: '#121c2b',
    borderColor: '#2d3a4a',
  },
  conditionButtonSelectedDark: {
    backgroundColor: '#1d2d44',
    borderColor: '#8bbcff',
  },
  textDark: {
    color: '#ffffff',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  conditionTextSelectedDark: {
    color: '#8bbcff',
  },
});

