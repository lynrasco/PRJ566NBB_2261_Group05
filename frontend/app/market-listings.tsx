import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getEbayListings } from '@/services/api';
import { useState, useEffect } from 'react';

type Listing = {
  id: string;
  marketplace: string;
  title: string;
  price?: string;
  imageUrl?: string;
  url?: string;
};
/*
const listings: Listing[] = [
  {
    id: 'best-fit',
    marketplace: 'Best Fit',
    title: 'Elegant black heels designed to provide both style and confidence.',
    price: '$57 - $70',
  },
  {
    id: 'facebook-1',
    marketplace: 'Facebook',
    title: 'Elegant black heels designed to provide both style and confidence.',
  },
  {
    id: 'ebay',
    marketplace: 'Ebay',
    title: 'Elegant black heels designed to provide both style and confidence.',
  },
  {
    id: 'facebook-2',
    marketplace: 'Facebook',
    title: 'Elegant black heels designed to provide both style and confidence.',
  },
  {
    id: 'facebook-3',
    marketplace: 'Facebook',
    title: 'Elegant black heels designed to provide both style and confidence.',
  },
];
*/

/*
export default function MarketListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const imageSource = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/partial-react-logo.png');
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <TouchableOpacity
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.list}>
        <TouchableOpacity onPress={() => router.push('/edit-item')}>
          <FeaturedListing listing={listings[0]} imageSource={imageSource} />
        </TouchableOpacity>

        {listings.slice(1).map((listing) => (
          <MarketplaceListing key={listing.id} listing={listing} imageSource={imageSource} />
        ))}
      </View>
    </ScrollView>
  );
}
*/
export default function MarketListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { imageUri, conditionId } = useLocalSearchParams<{
    imageUri?: string;
    condition?: string;
    conditionId?: string;
  }>();

  useEffect(() => {
    const loadListings = async () => {
      try {
        const data = await getEbayListings('black heels', conditionId);
        //console.log('EBAY LISTINGS:', data);

        // To log all listings from Ebay for testing:
        console.log('EBAY LISTINGS:', JSON.stringify(data, null, 2));
        setListings(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadListings();
  }, [conditionId]);

  const imageSource = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/partial-react-logo.png');

  const featured = listings.length > 0 ? listings[0] : null;
  const rest = listings.length > 1 ? listings.slice(1) : [];

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <TouchableOpacity
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {listings.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Waiting for eBay listings...
        </Text>
      ) : (
        <View style={styles.list}>
          {featured && (
            <TouchableOpacity onPress={() => router.push('/edit-item')}>
              <FeaturedListing listing={featured} imageSource={imageSource} />
            </TouchableOpacity>
          )}

          {rest.map((listing) => (
            <MarketplaceListing
              key={listing.id}
              listing={listing}
              imageSource={imageSource}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function FeaturedListing({
  listing,
  imageSource,
}: {
  listing: Listing;
  imageSource: { uri: string } | number;
}) {
  return (
    <View style={styles.featuredWrapper}>
      <Text style={styles.marketplaceLabel}>{listing.marketplace}</Text>
      <View style={styles.featuredCard} pointerEvents="none">
        <Image
        source={
          listing.imageUrl
          ? { uri: listing.imageUrl }
          : require('@/assets/images/partial-react-logo.png')
        }
        style={styles.featuredImage}
        />
        <Text style={styles.featuredPrice}>{listing.price}</Text>
        <Text style={styles.featuredTitle}>{listing.title}</Text>
      </View>
    </View>
  );
}

function MarketplaceListing({
  listing,
  imageSource,
}: {
  listing: Listing;
  imageSource: { uri: string } | number;
}) {
  return (
    <View style={styles.listingWrapper}>
      <Text style={styles.marketplaceLabel}>{listing.marketplace}</Text>
      <View style={styles.listingCard}>
        <Image
        source={
          listing.imageUrl
          ? { uri: listing.imageUrl }
          : require('@/assets/images/partial-react-logo.png')
        } style={styles.thumbnail}
        />
        <Text style={styles.listingTitle}>{listing.title}</Text>
      </View>
    </View>
  );
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
    backgroundColor: '#eeeeee',
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
});

