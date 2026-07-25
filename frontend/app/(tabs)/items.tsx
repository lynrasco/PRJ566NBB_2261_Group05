import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAllItems } from '@/services/api';
import { useAppTheme } from '@/context/theme-context';
import { useTranslation } from '@/hooks/use-translation';

type UserItem = {
  _id?: string;
  id?: string;
  title?: string;
  brand?: string;
  category?: string;
  description?: string;
  price?: number | string;
  imageUrl?: string;
  status?: string;
  sold?: boolean;
  confidence?: number;
  matchScore?: number;
  valueScore?: number;
};

//const FILTERS = ['All', 'Footwear', 'Accessories', 'Outerwear'];
const FILTERS = ['all', 'footwear', 'accessories', 'outerwear'];

export default function ItemsScreen() {
  const [items, setItems] = useState<UserItem[]>([]);
  //const [activeFilter, setActiveFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllItems();
      setItems(response.success && Array.isArray(response.items) ? response.items : []);
    } catch (err: any) {
      setError(err.message || t('failedToLoadItems'));
    } finally {
      setLoading(false);
    }
  };

  const soldItems = useMemo(() => {
    const sold = items.filter((item) => {
      const status = item.status?.toLowerCase();
      return item.sold || status === 'sold' || status === 'completed';
    });

    return sold.length > 0 ? sold : items;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return soldItems;
    }

    return soldItems.filter((item) => {
      const category = item.category?.toLowerCase() || '';
      return category.includes(activeFilter.toLowerCase());
    });
  }, [activeFilter, soldItems]);

  const totalValue = useMemo(
    () => soldItems.reduce((total, item) => total + getNumericPrice(item.price), 0),
    [soldItems]
  );

  const openItem = (item: UserItem) => {
    router.push({
      pathname: '/edit-item',
      params: {
        itemId: item._id || item.id,
        title: item.title,
        brand: item.brand,
        category: item.category,
        description: item.description,
        price: item.price?.toString() || '',
        imageUrl: item.imageUrl,
      },
    });
  };

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => item._id || item.id || `${item.title}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.cardRow}
        contentContainerStyle={[styles.content, isDark && styles.contentDark,]}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, isDark && styles.textDark]}>
              {t('myItems')}
            </Text>
            <Text style={[styles.summary, isDark && styles.mutedTextDark]}>
              {soldItems.length} {t('valuedItems')} · ${totalValue.toLocaleString()} {t('total')}
            </Text>

            <View style={styles.filters}>
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[styles.filterChip, isDark && styles.filterChipDark, isActive && styles.filterChipActive,]}
                  >
                    <Text style={[styles.filterText, isDark && styles.filterTextDark, isActive && styles.filterTextActive,]}>
                      {t(filter)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.stateBlock}>
            {loading ? (
              <>
                <ActivityIndicator color="#024883" />
                <Text style={[styles.stateText, isDark && styles.mutedTextDark]}>
                  {t('loadingItems')}
                </Text>
              </>
            ) : error ? (
              <>
                <Text style={[styles.errorText, isDark && styles.errorTextDark]}>{error}</Text>
                <Pressable onPress={fetchItems} style={styles.retryButton}>
                  <Text style={styles.retryText}>
                    {t('retry')}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.stateText}>
                {t('noSoldItems')}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => <SoldItemCard item={item} onPress={() => openItem(item)} isDark={isDark}/>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function SoldItemCard({ item, onPress, isDark, }: { item: UserItem; onPress: () => void; isDark: boolean; }) {
  const { t } = useTranslation();
  const price = getNumericPrice(item.price);
  const confidence = Math.round(
    item.confidence || item.matchScore || item.valueScore || 85 + (price % 10)
  );

  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={[styles.card, isDark && styles.cardDark,]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {(item.title || t('item')).charAt(0)}
          </Text>
        </View>
      )}

      <Text numberOfLines={2} style={[styles.cardTitle, isDark && styles.textDark,]}>
        {item.title || t('untitledItem')}
      </Text>
      <Text numberOfLines={1} style={[styles.brand, isDark && styles.mutedTextDark,]}>
        {item.brand || item.category || t('soldItem')}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>${price}</Text>
        </View>
        <Text style={[styles.confidence, isDark && styles.mutedTextDark,]}>{confidence}%</Text>
      </View>
    </TouchableOpacity>
  );
}

function getNumericPrice(price: UserItem['price']) {
  if (typeof price === 'number') {
    return price;
  }

  const parsed = Number(String(price || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3f8',
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 120,
  },
  title: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 23,
    color: '#061421',
  },
  summary: {
    marginTop: 6,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    color: '#314760',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 28,
    marginBottom: 20,
  },
  filterChip: {
    height: 23,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#e8eef4',
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: '#00213b',
  },
  filterText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 10,
    color: '#58708b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  cardRow: {
    gap: 14,
  },
  card: {
    flex: 1,
    minHeight: 202,
    maxWidth: '48%',
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 10,
    shadowColor: '#5c7088',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 9,
    backgroundColor: '#eef2f5',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 28,
    color: '#7c91a8',
  },
  cardTitle: {
    marginTop: 12,
    minHeight: 28,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    lineHeight: 14,
    color: '#020910',
  },
  brand: {
    marginTop: 4,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 10,
    color: '#49617a',
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricePill: {
    minWidth: 48,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#d9f6eb',
    paddingHorizontal: 10,
  },
  priceText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#13a870',
  },
  confidence: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 9,
    color: '#1f3550',
  },
  stateBlock: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: 12,
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    color: '#58708b',
  },
  errorText: {
    maxWidth: 260,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    color: '#9b1c1c',
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#00213b',
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  retryText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 11,
    color: '#ffffff',
  },
  screenDark: {
    backgroundColor: '#08111f',
  },
  contentDark: {
    backgroundColor: '#08111f',
  },
  cardDark: {
    backgroundColor: '#121c2b',
  },
  placeholderDark: {
    backgroundColor: '#1d2d44',
  },
  filterChipDark: {
    backgroundColor: '#1d2d44',
  },
  filterTextDark: {
    color: '#b8c4d1',
  },
  textDark: {
    color: '#ffffff',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  errorTextDark: {
    color: '#ff9b9b',
  },
});
