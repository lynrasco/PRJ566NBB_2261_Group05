import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
//import { getEbayListings } from '@/services/api';
import { useState, useEffect } from 'react';
import { useAppTheme } from '@/context/theme-context';

type Listing = {
  id: string;
  marketplace: string;
  title: string;
  price?: string;
  imageUrl?: string;
  url?: string;
};

export default function MarketListingsScreen() {
  const { imageUri, listings } = useLocalSearchParams<{
    imageUri?: string;
    listings?: string;
  }>();

  //const parsedListings = listings ? JSON.parse(listings) : [];
  const parsedListings = parseListings(listings);
  const imageSource = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/partial-react-logo.png');

  const featured = parsedListings.length > 0 ? parsedListings[0] : null;
  const rest = parsedListings.length > 1 ? parsedListings.slice(1) : [];
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
};
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={[
        styles.contentContainer,isDark && styles.contentContainerDark,
      ]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
       <Text style={[styles.backIcon, isDark && styles.textDark]}>←</Text>
      </TouchableOpacity>

      {parsedListings.length === 0 ? (
        <Text style={[{textAlign:'center', marginTop:40,}, isDark && styles.mutedTextDark,]}>
          No listings received
        </Text>
      ) : (
        <View style={styles.list}>
          {featured && (
  <TouchableOpacity onPress={() => openEditItem(featured)}>
    <FeaturedListing listing={featured} imageSource={imageSource} isDark={isDark}/>
  </TouchableOpacity>
)}

          {rest.map((listing: Listing) => (
  <TouchableOpacity key={listing.id} onPress={() => openEditItem(listing)}>
    <MarketplaceListing
      listing={listing}
      imageSource={imageSource}
      isDark={isDark}
    />
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
        source={
          listing.imageUrl
          ? { uri: listing.imageUrl }
          : require('@/assets/images/partial-react-logo.png')
        }
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
        source={
          listing.imageUrl
          ? { uri: listing.imageUrl }
          : require('@/assets/images/partial-react-logo.png')
        } style={styles.thumbnail}
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

