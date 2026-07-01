import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { saveItemToMyItems } from '@/services/api';

type Listing = {
  id?: string;
  marketplace?: string;
  title?: string;
  brand?: string;
  category?: string;
  description?: string;
  condition?: string;
  price?: number | string;
  suggestedPrice?: number | string;
  priceLow?: number | string;
  priceHigh?: number | string;
  confidence?: number | string;
  pricePositionPercent?: number;
  imageUrl?: string;
  url?: string;
};

export default function ItemResultScreen() {
  const { imageUri, listings, condition } = useLocalSearchParams<{
    imageUri?: string;
    listings?: string;
    condition?: string;
  }>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const marketplaceListings = parseMarketplaceListings(listings);
  const primaryListing = marketplaceListings[0];
  const previewListings = marketplaceListings.slice(0, 3);
  const hasListing = Boolean(primaryListing);
  const displayPrice = primaryListing?.suggestedPrice ?? primaryListing?.price;
  const displayTitle = primaryListing?.title || 'Item analysis';
  const displayBrand = primaryListing?.brand || 'Brand';
  const displayCategory = primaryListing?.category || 'Item';
  const displayDescription = getDisplayDescription(primaryListing);
  const displayConfidence = primaryListing?.confidence ?? UI_PLACEHOLDERS.confidence;
  const listingPriceRange = getListingPriceRange(marketplaceListings);
  const displayLowPrice = primaryListing?.priceLow ?? listingPriceRange.low;
  const displayHighPrice = primaryListing?.priceHigh ?? listingPriceRange.high;
  const displayPricePosition =
    primaryListing?.pricePositionPercent ??
    getPricePositionPercent(getNumericPrice(displayPrice), displayLowPrice, displayHighPrice);
  const imageSource = primaryListing?.imageUrl
    ? { uri: primaryListing.imageUrl }
    : imageUri
    ? { uri: imageUri }
    : require('@/assets/images/partial-react-logo.png');

  const goToMarketListings = () => {
    router.push({
      pathname: '/market-listings',
      params: {
        imageUri: primaryListing?.imageUrl || imageUri,
        listings: JSON.stringify(marketplaceListings),
      },
    });
  };

  const saveToMyItems = async () => {
    if (!primaryListing || isSaving) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      await saveItemToMyItems({
        title: primaryListing.title,
        brand: primaryListing.brand,
        category: primaryListing.category,
        description: primaryListing.description,
        condition: primaryListing.condition || condition,
        price: getNumericPrice(displayPrice),
        imageUrl: imageUri,
      });
      router.replace('/(tabs)/items');
    } catch (error) {
      console.error('Error saving item:', error);
      setSaveError('Unable to save this item yet.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.hero}>
          <Image source={imageSource} style={styles.heroImage} />
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={[styles.iconCircle, styles.backButton]}
          >
            <Ionicons color="#ffffff" name="chevron-back" size={17} />
          </Pressable>
          <Pressable accessibilityLabel="Share item" style={[styles.iconCircle, styles.shareButton]}>
            <Ionicons color="#ffffff" name="share-social-outline" size={16} />
          </Pressable>
        </View>

        <View style={[styles.card, styles.priceCard]}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={2} selectable style={styles.itemTitle}>
                {displayTitle}
              </Text>
              <Text numberOfLines={1} selectable style={styles.brand}>
                {displayBrand}
              </Text>
            </View>
            <View style={styles.categoryPill}>
              <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} selectable style={styles.categoryText}>
                {displayCategory}
              </Text>
            </View>
          </View>

          <View style={styles.suggestedBox}>
            <Text selectable style={styles.suggestedLabel}>
              AI suggested price
            </Text>
            <Text
              selectable
              style={[styles.suggestedPrice, displayPrice == null && styles.unavailablePrice]}
            >
              {formatPrice(displayPrice) || UI_PLACEHOLDERS.price}
            </Text>
            <View style={styles.confidencePill}>
              <Ionicons color="#21b66c" name="checkmark" size={9} />
              <Text selectable style={styles.confidenceText}>
                {formatConfidence(displayConfidence)} confidence
              </Text>
            </View>
          </View>

          <View style={styles.rangeLabels}>
            <Text selectable style={styles.rangeText}>
              Low {formatPrice(displayLowPrice)}
            </Text>
            <Text selectable style={styles.rangeText}>
              High {formatPrice(displayHighPrice)}
            </Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${displayPricePosition}%` }]} />
            <View style={[styles.sliderThumb, { left: `${displayPricePosition}%` }]} />
          </View>
        </View>

        <View style={[styles.card, styles.descriptionCard]}>
          <Text selectable style={styles.sectionTitle}>
            Description
          </Text>
          <Text selectable style={styles.description}>
            {displayDescription}
          </Text>
        </View>

        <View style={[styles.card, styles.listingCard]}>
          <View style={styles.listingHeader}>
            <Text selectable style={styles.listingTitle}>
              {marketplaceListings.length > 0
                ? `Based on ${marketplaceListings.length} live listings`
                : 'No comparable listings available yet'}
            </Text>
            <Pressable accessibilityRole="button" onPress={goToMarketListings}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.previewList}>
            {previewListings.length > 0 ? (
              previewListings.map((listing, index) => (
                <View key={listing.id || `${listing.title}-${index}`} style={styles.previewRow}>
                  <View style={[styles.marketDot, { backgroundColor: dotColors[index % dotColors.length] }]} />
                  <View style={styles.previewTextBlock}>
                    <Text numberOfLines={1} selectable style={styles.previewTitle}>
                      {listing.title || 'Listing title unavailable'}
                    </Text>
                    <Text numberOfLines={1} selectable style={styles.previewMeta}>
                      {[listing.marketplace, listing.condition].filter(Boolean).join(' · ') ||
                        'Listing details unavailable'}
                    </Text>
                  </View>
                  <Text selectable style={styles.previewPrice}>
                    {formatPrice(listing.price) || '--'}
                  </Text>
                </View>
              ))
            ) : (
              <Text selectable style={styles.emptyText}>
                No comparable listings available yet
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)/dashboard')}
            style={styles.discardButton}
          >
            <Text style={styles.discardText}>Discard</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!hasListing || isSaving}
            onPress={saveToMyItems}
            style={[styles.saveButton, (!hasListing || isSaving) && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save to my items'}</Text>
          </Pressable>
        </View>
        {saveError && (
          <Text selectable style={styles.saveError}>
            {saveError}
          </Text>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function BottomNav() {
  return (
    <View style={styles.bottomNav}>
      <Pressable onPress={() => router.replace('/(tabs)/dashboard')} style={styles.navItem}>
        <Ionicons color="#6d7d8b" name="home-outline" size={17} />
        <Text style={styles.navLabel}>Home</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/(tabs)/camera')} style={styles.cameraNavButton}>
        <Ionicons color="#ffffff" name="camera-outline" size={21} />
      </Pressable>
      <Pressable onPress={() => router.replace('/(tabs)/items')} style={styles.navItem}>
        <Ionicons color="#6d7d8b" name="list-outline" size={18} />
        <Text style={styles.navLabel}>Items</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/(tabs)/settings')} style={styles.navItem}>
        <Ionicons color="#6d7d8b" name="person-outline" size={18} />
        <Text style={styles.navLabel}>Profile</Text>
      </Pressable>
    </View>
  );
}

function parseMarketplaceListings(listings?: string): Listing[] {
  if (!listings) {
    return [];
  }

  try {
    const parsed = JSON.parse(listings);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatPrice(price?: number | string) {
  if (price == null || price === '') {
    return '';
  }

  if (typeof price === 'number') {
    return `$${Math.round(price)}`;
  }

  if (/not available|unavailable/i.test(price)) {
    return '';
  }

  const parsed = getNumericPrice(price);
  if (parsed != null) {
    return `$${Math.round(parsed)}`;
  }

  return price.replace(/^USD\s*/i, '$').trim();
}

function getNumericPrice(price?: number | string) {
  if (typeof price === 'number') {
    return price;
  }

  const numericMatch = String(price || '').match(/\d+(\.\d+)?/);
  if (!numericMatch) {
    return undefined;
  }

  const parsed = Number(numericMatch[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getListingPriceRange(listings: Listing[]) {
  const prices = listings
    .map((listing) => getNumericPrice(listing.suggestedPrice ?? listing.price))
    .filter((price): price is number => typeof price === 'number');

  if (prices.length === 0) {
    return {
      low: UI_PLACEHOLDERS.lowPrice,
      high: UI_PLACEHOLDERS.highPrice,
    };
  }

  return {
    low: Math.min(...prices),
    high: Math.max(...prices),
  };
}

function getPricePositionPercent(price?: number, low?: number | string, high?: number | string) {
  const numericLow = getNumericPrice(low);
  const numericHigh = getNumericPrice(high);

  if (price == null || numericLow == null || numericHigh == null || numericHigh <= numericLow) {
    return UI_PLACEHOLDERS.pricePositionPercent;
  }

  return Math.min(88, Math.max(12, ((price - numericLow) / (numericHigh - numericLow)) * 100));
}

function formatConfidence(confidence?: number | string) {
  if (confidence == null || confidence === '') {
    return `${UI_PLACEHOLDERS.confidence}%`;
  }

  return String(confidence).includes('%') ? String(confidence) : `${confidence}%`;
}

function getDisplayDescription(listing?: Listing) {
  if (!listing) {
    return 'No listing details are available yet.';
  }

  if (listing.description) {
    return listing.description;
  }

  const details = [listing.title, listing.condition, listing.marketplace].filter(Boolean);
  if (details.length > 0) {
    return details.join(' · ');
  }

  return 'No listing details are available yet.';
}

const dotColors = ['#086cd8', '#b22055', '#ff2714'];

const UI_PLACEHOLDERS = {
  price: '$--',
  lowPrice: 57,
  highPrice: 83,
  confidence: 92,
  pricePositionPercent: 50,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 95,
  },
  hero: {
    height: 252,
    backgroundColor: '#b7e8f3',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconCircle: {
    position: 'absolute',
    top: 53,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(44, 69, 76, 0.58)',
  },
  backButton: {
    left: 18,
  },
  shareButton: {
    right: 18,
  },
  card: {
    marginHorizontal: 21,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    boxShadow: '0 14px 24px rgba(69, 89, 112, 0.12)',
  },
  priceCard: {
    marginTop: -7,
    paddingTop: 17,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 7,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 17,
    lineHeight: 21,
    color: '#101a27',
  },
  brand: {
    marginTop: 1,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    lineHeight: 16,
    color: '#5f7084',
  },
  categoryPill: {
    minHeight: 23,
    maxWidth: 104,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#e2edf7',
    paddingHorizontal: 8,
  },
  categoryText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#0a4377',
  },
  suggestedBox: {
    minHeight: 119,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: '#eaf1f8',
    paddingVertical: 15,
  },
  suggestedLabel: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    color: '#5c6d81',
  },
  suggestedPrice: {
    marginTop: 3,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 39,
    lineHeight: 44,
    color: '#073e70',
    fontVariant: ['tabular-nums'],
  },
  unavailablePrice: {
    maxWidth: '88%',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 21,
  },
  pendingText: {
    marginTop: 5,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#5c6d81',
  },
  confidencePill: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: '#e5f9ef',
    paddingHorizontal: 12,
  },
  confidenceText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#21b66c',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
  },
  rangeText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    color: '#5c6d81',
  },
  sliderTrack: {
    height: 8,
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: '#e2ebf4',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00365f',
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    borderWidth: 3,
    borderColor: '#06497e',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#101a27',
  },
  descriptionCard: {
    marginTop: 14,
  },
  description: {
    marginTop: 14,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    lineHeight: 21,
    color: '#5c6d81',
  },
  listingCard: {
    marginTop: 14,
    paddingBottom: 14,
  },
  listingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  listingTitle: {
    flex: 1,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 15,
    lineHeight: 19,
    color: '#101a27',
  },
  viewAll: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 13,
    color: '#1678e8',
  },
  previewList: {
    gap: 9,
    marginTop: 9,
  },
  previewRow: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewTextBlock: {
    flex: 1,
  },
  previewTitle: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    lineHeight: 14,
    color: '#101a27',
  },
  previewMeta: {
    marginTop: 1,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 13,
    color: '#5c6d81',
  },
  previewPrice: {
    width: 39,
    textAlign: 'right',
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 15,
    color: '#073e70',
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    lineHeight: 18,
    color: '#5c6d81',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 21,
    marginTop: 18,
  },
  discardButton: {
    minHeight: 39,
    minWidth: 102,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#dfe8f1',
    borderRadius: 20,
    backgroundColor: '#f7faff',
  },
  discardText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#073e70',
  },
  saveButton: {
    flex: 1,
    minHeight: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#024883',
  },
  saveButtonDisabled: {
    backgroundColor: '#8aa4bc',
  },
  saveText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  saveError: {
    marginHorizontal: 21,
    marginTop: 8,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#b42318',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 83,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#d9e2eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingBottom: 9,
  },
  navItem: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 10,
    color: '#6d7d8b',
  },
  cameraNavButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#255b89',
    boxShadow: '0 18px 34px rgba(31, 88, 136, 0.25)',
  },
});