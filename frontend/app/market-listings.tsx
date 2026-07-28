import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
//import { getEbayListings } from '@/services/api';
import { useState } from 'react';
import { useAppTheme } from '@/context/theme-context';
import { getItemById, saveItemToMyItems } from '@/services/api';
import { useTranslation } from '@/hooks/use-translation'


type Listing = {
  id: string;
  marketplace: string;
  title: string;
  brand?: string;
  category?: string;
  description?: string;
  condition?: string;
  price?: string;
  imageUrl?: string;
  url?: string;
};

type SavedItem = {
  _id: string;
  title?: string;
  brand?: string;
  category?: string;
  description?: string;
  condition?: string;
  price?: number | string;
  imageUrl?: string;
};

export default function MarketListingsScreen() {
  const { imageUri, listings } = useLocalSearchParams<{
    imageUri?: string;
    listings?: string;
  }>();
  //const parsedListings = listings ? JSON.parse(listings) : [];
  const parsedListings = parseListings(listings);
  const [savingListingId, setSavingListingId] = useState<string | null>(null);
  const [savedItemsByListingId, setSavedItemsByListingId] = useState<Record<string, SavedItem>>({});
  const imageSource = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/no-img-available.jpg');

  const featured = parsedListings.length > 0 ? parsedListings[0] : null;
  const rest = parsedListings.length > 1 ? parsedListings.slice(1) : [];
  const { t } = useTranslation();
  /*
  const openEditItem = (listing: Listing) => {
    router.push({
    pathname: '/edit-item',
    params: {
      itemId: String(listing.id || ''),
      title: String(listing.title || ''),
      price: getNumericPriceString(listing.price),
      imageUrl: String(listing.imageUrl || imageUri || ''),
    },
  });
}
*/
/*
 const openEditItem = async (listing: Listing) => {
  if (savingListingId) return;

  try {
    setSavingListingId(listing.id);

    const savedResponse = await saveItemToMyItems({
      title: listing.title,
      brand: listing.brand,
      category: listing.category,
      description: listing.description,
      condition: listing.condition,
      price: getNumericPrice(listing.price),
      imageUrl: listing.imageUrl || imageUri,
    });

    const savedItem = savedResponse.item;

    console.log('Saved marketplace item response:', savedResponse);
    console.log('Saved MongoDB item ID:', savedItem?._id);

    if (!savedItem?._id) {
      console.log('Saved item missing MongoDB _id:', savedResponse);
      return;
    }

    router.push({
      pathname: '/edit-item',
      params: {
        itemId: savedItem._id,
        title: savedItem.title || listing.title || '',
        brand: savedItem.brand || listing.brand || '',
        category: savedItem.category || listing.category || '',
        description: savedItem.description || listing.description || '',
        price: String(savedItem.price || getNumericPriceString(listing.price)),
        imageUrl: savedItem.imageUrl || listing.imageUrl || imageUri || '',
      },
    });
  } catch (error) {
    console.error('Failed to save marketplace listing before edit:', error);
  } finally {
    setSavingListingId(null);
  }
};
*/

const openEditItem = async (listing: Listing) => {
  if (savingListingId) return;

  try {
    setSavingListingId(listing.id);

    let savedItem = savedItemsByListingId[listing.id];

    // If this marketplace listing was already saved before,
    // fetch the latest MongoDB version so edited fields like brand show up.
    if (savedItem?._id) {
      const latestResponse = await getItemById(savedItem._id);
      savedItem = latestResponse.item || savedItem;
    } else {
      const savedResponse = await saveItemToMyItems({
        title: listing.title,
        brand: listing.brand,
        category: listing.category,
        description: listing.description,
        condition: listing.condition,
        price: getNumericPrice(listing.price),
        imageUrl: listing.imageUrl || imageUri,
      });

      savedItem = savedResponse.item;

      console.log('Saved marketplace item response:', savedResponse);
      console.log('Saved MongoDB item ID:', savedItem?._id);

      if (savedItem?._id) {
        setSavedItemsByListingId((previous) => ({
          ...previous,
          [listing.id]: savedItem,
        }));
      }
    }

    if (!savedItem?._id) {
      console.log('Saved item missing MongoDB _id:', savedItem);
      return;
    }

    router.push({
      pathname: '/edit-item',
      params: {
        itemId: savedItem._id,
        title: savedItem.title || listing.title || '',
        brand: savedItem.brand || listing.brand || '',
        category: savedItem.category || listing.category || '',
        description: savedItem.description || listing.description || '',
        price: String(savedItem.price || getNumericPriceString(listing.price)),
        imageUrl: savedItem.imageUrl || listing.imageUrl || imageUri || '',
      },
    });
  } catch (error) {
    console.error('Failed to open marketplace listing for edit:', error);
  } finally {
    setSavingListingId(null);
  }
};
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={[
        styles.contentContainer,isDark && styles.contentContainerDark,
      ]}>
      <TouchableOpacity accessibilityLabel={t('goBack')} onPress={() => router.back()} style={styles.backButton}>
       <Text style={[styles.backIcon, isDark && styles.textDark]}>←</Text>
      </TouchableOpacity>

      {parsedListings.length === 0 ? (
        <Text style={[{textAlign:'center', marginTop:40,}, isDark && styles.mutedTextDark,]}>
          {t('noListingsReceived')}
        </Text>
      ) : (
        <View style={styles.list}>
          {featured && (
            <TouchableOpacity disabled={savingListingId === featured.id} onPress={() => openEditItem(featured)}>
              <FeaturedListing listing={featured} imageSource={imageSource} isDark={isDark}/>
            </TouchableOpacity>
          )}

          {rest.map((listing: Listing) => (
            <TouchableOpacity key={listing.id} disabled={savingListingId === listing.id} onPress={() => openEditItem(listing)}>
              <MarketplaceListing listing={listing} imageSource={imageSource} isDark={isDark}/>
            </TouchableOpacity>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

function FeaturedListing({
  listing,
  imageSource,
  isDark,
}: {
  listing: Listing;
  imageSource: { uri: string } | number;
  isDark: boolean;
}) {
  return (
    <View style={styles.featuredWrapper}>
      <Text style={styles.marketplaceLabel}>{listing.marketplace}</Text>
      <View style={[styles.featuredCard, isDark && styles.cardDark,]} pointerEvents="none">
        <Image
        source={listing.imageUrl ? { uri: listing.imageUrl } : imageSource}
        style={styles.featuredImage}
        />
        <Text style={[styles.featuredPrice, isDark && styles.textDark,]}>{listing.price}</Text>
        <Text style={[styles.featuredTitle, isDark && styles.mutedTextDark,]}>{listing.title}</Text>
      </View>
    </View>
  );
}

function MarketplaceListing({
  listing,
  imageSource,
  isDark,
}: {
  listing: Listing;
  imageSource: { uri: string } | number;
  isDark: boolean;
}) {
  return (
    <View style={styles.listingWrapper}>
      <Text style={[styles.marketplaceLabel, isDark && styles.accentTextDark,]}>{listing.marketplace}</Text>
      <View style={[styles.listingCard, isDark && styles.cardDark,]}>
        <Image
        source={listing.imageUrl ? { uri: listing.imageUrl } : imageSource}
        style={styles.thumbnail}
        />
        <Text style={[styles.listingTitle, isDark && styles.textDark,]}>{listing.title}</Text>
      </View>
    </View>
  );
}
function parseListings(listings?: string): Listing[] {
  if (!listings) return [];

  try {
    const parsed = JSON.parse(listings);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getNumericPriceString(price?: string) {
  const match = String(price || '').match(/\d+(\.\d+)?/);
  return match ? match[0] : '50';
}

function getNumericPrice(price?: string) {
  const match = String(price || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingTop: 68,
    paddingHorizontal: 39,
    paddingBottom: 92,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    lineHeight: 28,
    color: '#111111',
  },
  list: {
    marginTop: 50,
    gap: 18,
  },
  featuredWrapper: {
    gap: 4,
  },
  marketplaceLabel: {
    marginLeft: 12,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#111111',
  },
  featuredCard: {
    borderRadius: 7,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 5,
    gap: 5,
  },
  featuredImage: {
    alignSelf: 'center',
    width: '100%',
    height: 140,
    borderRadius: 6,
    resizeMode: 'contain',
  },
  featuredPrice: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 10,
    color: '#111111',
  },
  featuredTitle: {
    alignSelf: 'center',
    maxWidth: 214,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#111111',
  },
  listingWrapper: {
    gap: 4,
  },
  listingCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#ffffff',
    paddingHorizontal: 9,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 5,
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 3,
    backgroundColor: '#1d2d44',
    resizeMode: 'cover',
  },
  listingTitle: {
    flex: 1,
    marginLeft: 16,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#111111',
  },
  containerDark:{
    backgroundColor:'#08111f',
  },
  contentContainerDark:{
    backgroundColor:'#08111f',
  },
  cardDark:{
    backgroundColor:'#121c2b',
  },
  textDark:{
    color:'#ffffff',
  },
  mutedTextDark:{
    color:'#b8c4d1',
  },
  accentTextDark:{
    color:'#8bbcff',
  },
  thumbnailDark:{
    backgroundColor:'#1d2d44',
  },
});

