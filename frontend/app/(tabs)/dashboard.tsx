import { Alert, StyleSheet, ScrollView, Modal, View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardHeader } from '@/components/dashboard-header';
import { MainItemTile } from '@/components/main-item-tile';
import { ListItem } from '@/components/list-item';
import { useState, useCallback } from 'react';
import { getAllItems, getDashboardAnalytics, deleteItem, listItemToEbay } from '@/services/api';
import AnalyticsCharts from '@/components/analytics-charts';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/theme-context';
import { useTranslation } from "@/hooks/use-translation";
import { useProfile } from '@/context/profile-context';

export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const { profile, avatarSource } = useProfile();
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

      const [itemsResponse, analyticsResponse] = await Promise.allSettled([
        getAllItems(),
        getDashboardAnalytics(),
      ]);

      if (itemsResponse.status === 'fulfilled' && itemsResponse.value?.success && itemsResponse.value?.items) {
        console.log('ALL ITEMS FROM MONGODB:', itemsResponse.value.items);
        setItems(itemsResponse.value.items);
      } else {
        throw new Error('Unable to load your items right now.');
      }

      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value?.success) {
        setAnalytics(analyticsResponse.value.analytics);
      } else {
        setAnalytics(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: any) => {
    console.log(item);
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handlePushToEbay = async (item: any) => {
    const itemId = item._id || item.id || String(Date.now());

    try {
      const payload = {
        id: itemId,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        categoryId: item.categoryId,
        brand: item.brand,
        condition: item.condition,
        imageUrl: item.imageUrl,
      };

      const response = await listItemToEbay(payload);

      if (response?.success) {
        //Alert.alert('eBay Listing', 'Item successfully sent to eBay.');
        Alert.alert(t('ebayListing'), t('ebayListingSuccess'));
      } else {
        //throw new Error(response?.message || 'Unable to list item.');
        throw new Error(response?.message || t('ebayListingError'));
      }
    } catch (error: any) {
      console.error('Failed to push item to eBay:', error);
      const responseError = error?.response?.data;
      const ebayDetail =
        responseError?.details?.errors?.[0]?.longMessage ||
        responseError?.details?.errors?.[0]?.message ||
        responseError?.details?.message;
      const message =
        ebayDetail ||
        responseError?.message ||
        error?.message ||
        'Failed to push item to eBay.';
      Alert.alert('eBay Listing Failed', message);
    }
  };

  /*
  useEffect(() => {
    if (!items[0]?._id) {
      setMarketAnalytics(null);
      return;
    }

    let isActive = true;

    const loadMarketAnalytics = async () => {
      try {
        const response = await getItemMarketAnalytics(items[0]._id);
        if (isActive) {
          setMarketAnalytics(response?.analytics || response);
        }
      } catch {
        if (isActive) {
          setMarketAnalytics(null);
        }
      }
    };

    loadMarketAnalytics();

    return () => {
      isActive = false;
    };
  }, [items]);
  */

  const summary = analytics || {
    totalSavedItems: items.length,
    averageSuggestedPrice: 0,
    marketplaceComparables: 0,
    categoryBreakdown: {},
    conditionBreakdown: {},
    recentItems: items.slice(0, 5),
  };

  const categoryEntries = (
    Object.entries(summary.categoryBreakdown || {}) as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const conditionEntries = (
    Object.entries(summary.conditionBreakdown || {}) as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  //const recentItems = (summary.recentItems || []).slice(0, 4);
  const sortedItems = [...items].sort((a, b) => getItemCreatedTime(b) - getItemCreatedTime(a));
  const uploadedItems = sortedItems.filter((item) => isUploadedItem(item));
  const previousListing = sortedItems[0];
  const recentItems = uploadedItems.slice(0, 4);

  const totalEstimatedValue = items.reduce((sum, item) => {
  return sum + getNumericPrice(item.suggestedPrice ?? item.estimatedPrice ?? item.price);
  }, 0);
  const formattedTotalEstimatedValue = `$${totalEstimatedValue.toFixed(2)}`;

  const handleDeleteItem = () => {
    //if (!selectedItem?._id) return;
    const itemId = selectedItem?._id || selectedItem?.id;
    if (!itemId) return;

    Alert.alert(
      t('deleteItem'),
      t('deleteListingConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            console.log(selectedItem);
            console.log(selectedItem?._id);
            try {
              //await deleteItem(selectedItem._id);
              await deleteItem(itemId);
              setModalVisible(false);
              fetchItems();
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  return (
  <>
    <ScrollView style={[styles.scrollView, isDark && styles.scrollViewDark]} showsVerticalScrollIndicator={false}>
      {/* Dashboard Header */}
      <DashboardHeader
        userName={profile.name.split(' ')[0] || profile.username}
        profileImage={avatarSource}
        totalEstimatedValue={formattedTotalEstimatedValue}
      />

      {/* Loading State */}
      {loading && (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#024883" />
          <ThemedText style={styles.loadingText}>
            {t('loadingItems')}
          </ThemedText>
        </ThemedView>
      )}

      {/* Error State */}
      {error && !loading && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>⚠️ Error: {error}</ThemedText>
          <Pressable style={styles.retryButton} onPress={fetchItems}>
            <Text style={styles.retryButtonText}>
              {t('retry')}
            </Text>
          </Pressable>
        </ThemedView>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {t('noItems')}
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {t('uploadFirstItem')}
          </ThemedText>
        </ThemedView>
      )}

      {!loading && !error && (
        <ThemedView style={[styles.analyticsSection, isDark && styles.analyticsSectionDark]}>
           <Pressable
            style={styles.analyticsHeader}
            onPress={() => setAnalyticsExpanded((isExpanded) => !isExpanded)}
            accessibilityRole="button"
            accessibilityLabel={t('analyticsOverview')}
            accessibilityState={{ expanded: analyticsExpanded }}
          >
            <ThemedText type="subtitle" style={[styles.analyticsTitle, isDark && styles.textDark]}>
              {t('analyticsOverview')}
            </ThemedText>
            <Ionicons
              name={analyticsExpanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={isDark ? '#ffffff' : '#024883'}
            />
          </Pressable>


          {analyticsExpanded && <View style={styles.analyticsContent}>
          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCardPrimary, isDark && styles.cardDark]}>
              <ThemedText style={[styles.metricsLabel, isDark && styles.textDark]}>
                {t('savedItems')}
              </ThemedText>
              <ThemedText type="title" style={[styles.metricsValue, isDark && styles.accentTextDark]}>
                {summary.totalSavedItems}
              </ThemedText>
              <ThemedText style={[styles.metricsHint, isDark && styles.mutedTextDark]}>
                {t('itemsInCollection')}
              </ThemedText>
            </View>

            <View style={[styles.analyticsCardPrimary, isDark && styles.cardDark]}>
              <ThemedText style={[styles.metricsLabel, isDark && styles.textDark]}>
                {t('avgSuggestedPrice')}
              </ThemedText>
              <ThemedText type="title" style={[styles.metricsValue, isDark && styles.accentTextDark]}>
                {summary.averageSuggestedPrice ? `$${summary.averageSuggestedPrice}` : '$0'}
              </ThemedText>
              <ThemedText style={[styles.metricsHint, isDark && styles.mutedTextDark]}>
                {t('currentSuggestions')}
              </ThemedText>
            </View>
          </View>

          <View style={styles.analyticsGridTwo}>
            <View style={[styles.analyticsCardSecondary, isDark && styles.cardDark]}>
              <ThemedText style={[styles.metricsLabel, isDark && styles.textDark]}>
                {t('categoryMix')}
              </ThemedText>
              {categoryEntries.length > 0 ? categoryEntries.map(([label, count]) => (
                <View key={label} style={styles.breakdownRow}>
                  <ThemedText style={[styles.breakdownLabel, isDark && styles.mutedTextDark]}>{label}</ThemedText>
                  <ThemedText style={[styles.breakdownValue, isDark && styles.accentTextDark]}>{count}</ThemedText>
                </View>
              )) : (
                <ThemedText style={styles.emptyBreakdown}>
                  {t('noCategories')}
                </ThemedText>
              )}
            </View>

            <View style={[styles.analyticsCardSecondary, isDark && styles.cardDark]}>
              <ThemedText style={[styles.metricsLabel, isDark && styles.textDark]}>
                {t('conditionMix')}
              </ThemedText>
              {conditionEntries.length > 0 ? conditionEntries.map(([label, count]) => (
                <View key={label} style={styles.breakdownRow}>
                  <ThemedText style={[styles.breakdownLabel, isDark && styles.mutedTextDark]}>{label}</ThemedText>
                  <ThemedText style={[styles.breakdownValue, isDark && styles.accentTextDark]}>{count}</ThemedText>
                </View>
              )) : (
                <ThemedText style={styles.emptyBreakdown}>
                  {t('noConditionData')}
                </ThemedText>
              )}
            </View>
          </View>
           <AnalyticsCharts
              categoryBreakdown={summary.categoryBreakdown}
              conditionBreakdown={summary.conditionBreakdown}
            />
        </View>}
        </ThemedView>
      )}

      {/* Main Item Tile - First Item (Featured) */}
      {!loading && !error && previousListing && (
  <ThemedView style={[styles.sectionContainer, isDark && styles.sectionContainerDark]}>
    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a1a1a', marginBottom: 5 }]}>
      {t('previousListing')}
    </ThemedText>

    <MainItemTile
      title={previousListing.title || t('untitled')}
      brand={previousListing.brand}
      priceRange={previousListing.price ? `$${previousListing.price}` :  t('priceTBD')}
      description={previousListing.description || previousListing.category || previousListing.condition}
      image={previousListing.imageUrl}
      onPress={() => handleItemPress(previousListing)}
    />
  </ThemedView>
)}

      {!loading && !error && recentItems.length > 0 && (
        <ThemedView style={[styles.suggestedSection, isDark && styles.suggestedSectionDark]}>
          <ThemedText type="subtitle" style={[ styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a1a1a', marginBottom: 5 }, ]}>
            {t('recentActivity')}
          </ThemedText>
          {recentItems.map((item: any, index: number) => (
            <ListItem
              key={item._id || item.id || index}
              //key={item.id || index}
              title={item.title || t('untitled')}
              price={item.price ? `$${item.price}` : t('priceTBD')}
              description={item.brand || item.description || item.category || item.condition}
              image={item.imageUrl}
              onPress={() => handleItemPress(item)}
              onArrowPress={() => handlePushToEbay(item)}
            />
          ))}
        </ThemedView>
      )}

      
      <ThemedView style={[styles.bottomSpacer, isDark && styles.bottomSpacerDark]} />
    </ScrollView>

    {/* Item Detail Modal */}
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setModalVisible(false)}
        />
        <View style={[styles.modalContent, isDark && styles.modalContentDark,]}>

          <View style={styles.modalBar}>
            <Pressable onPress={handleDeleteItem}>
              <Ionicons name="trash-outline" size={25} color={isDark ? '#ffffff' : '#000000'}/>
            </Pressable>

            <Pressable style={[styles.editButton, isDark && styles.editButtonDark,]}
              hitSlop={15}
              onPress={() => {
              setModalVisible(false);
              if (selectedItem) {
                router.push({
                  pathname: '/edit-item',
                  params: {
                    //itemId: selectedItem._id,
                    itemId: selectedItem._id || selectedItem.id,
                    title: selectedItem.title,
                    brand: selectedItem.brand,
                    category: selectedItem.category,
                    description: selectedItem.description,
                    price: selectedItem.price?.toString() || '',
                    imageUrl: selectedItem.imageUrl,
                  },
                });
              }
            }}
            >
              <ThemedText type="default" style={styles.editButtonText}>
                {t('editButton')}
              </ThemedText>
            </Pressable>
          </View>
          {selectedItem?.imageUrl && (
            <Image source={{ uri: selectedItem.imageUrl }} style={[styles.modalImage, isDark && styles.modalImageDark,]} />
          )}

          <ThemedText type="defaultSemiBold" style={[{fontSize: 13, textAlign: 'center', marginBottom: 12,},isDark && styles.textDark,]}>
              {selectedItem?.title}
          </ThemedText>
          {selectedItem?.brand && (
            <>
              <ThemedText type="defaultSemiBold" style={[{fontSize: 13},isDark && styles.textDark,]}>
                {t('brand')}:
              </ThemedText>
              <ThemedText type="default"style={[{fontSize:10, marginBottom:10, lineHeight:11,}, isDark ? styles.mutedTextDark : { color:'#000' },]}>
                {selectedItem.brand}
              </ThemedText>
            </>
          )}
          {selectedItem?.category && (
            <>
              <ThemedText type="defaultSemiBold" style={[{fontSize: 13},isDark && styles.textDark,]}>
                {t('category')}:
              </ThemedText>
              <ThemedText type="default"style={[{fontSize:10, marginBottom:10, lineHeight:11,}, isDark ? styles.mutedTextDark : { color:'#000' },]}>
                {selectedItem.category}
              </ThemedText>
            </>
          )}
          {selectedItem?.description && (
            <>
              <ThemedText type="defaultSemiBold" style={[{fontSize: 13},isDark && styles.textDark,]}>
                {t('description')}:
              </ThemedText>
              <ThemedText type="default"style={[{fontSize:10, marginBottom:10, lineHeight:11,}, isDark ? styles.mutedTextDark : { color:'#000' },]}>
                {selectedItem.description}
              </ThemedText>
            </>
          )}
          {selectedItem?.condition && (
            <>
              <ThemedText type="defaultSemiBold" style={[{fontSize: 13},isDark && styles.textDark,]}>
                {t('condition')}:
              </ThemedText>
              <ThemedText type="default"style={[{fontSize:10, marginBottom:10, lineHeight:11,}, isDark ? styles.mutedTextDark : { color:'#000' },]}>
                {selectedItem.condition}
              </ThemedText>
            </>
          )}
          {selectedItem?.price !== undefined && selectedItem?.price !== null && (
  <>
    <ThemedText type="defaultSemiBold" style={[{fontSize: 13}, isDark && styles.textDark]}>
      {t('price')}:
    </ThemedText>
    <ThemedText
      type="default"
      style={[
        { fontSize: 10, marginBottom: 10, lineHeight: 11 },
        isDark ? styles.mutedTextDark : { color: '#000' },
      ]}
    >
      ${selectedItem.price}
    </ThemedText>
  </>
)}
        </View>
      </View>
    </Modal>
    </>
  );
}

function isUploadedItem(item: any) {
  const imageUrl = String(item.imageUrl || '');
  return imageUrl.includes('/uploads/') || imageUrl.startsWith('uploads/');
}

/*
function getItemCreatedTime(item: any) {
  const id = item._id || item.id;

  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    return parseInt(id.substring(0, 8), 16) * 1000;
  }

  const timestamp = new Date(item.createdAt || item.updatedAt || item.uploadDate || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}
*/
function getItemCreatedTime(item: any) {
  const id = item._id || item.id;

  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    return parseInt(id.substring(0, 8), 16) * 1000;
  }

  const timestamp = new Date(
    item.createdAt || item.updatedAt || item.uploadDate || 0
  ).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getNumericPrice(value: any) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  return 0;
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  analyticsSection: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#f4f9ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dce7f2',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  analyticsGridTwo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  analyticsCardPrimary: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
  },
  analyticsCardSecondary: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
  },
  metricsLabel: {
    fontSize: 12,
    color: '#5f6f7a',
    marginBottom: 6,
  },
  metricsValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#024883',
  },
  metricsHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#7b8793',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 12,
    color: '#30404d',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#024883',
  },
  emptyBreakdown: {
    marginTop: 8,
    fontSize: 12,
    color: '#7b8793',
  },
  marketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
  },
  marketValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  marketHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#7b8793',
  },
  sectionContainer: {
    marginVertical: 12,
    backgroundColor: '#ffffff',
  },
  suggestedSection: {
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 16,
    color: '#024883',
  },
  centerContainer: {
    marginVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#024883',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    marginVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  modalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    /*
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    paddingHorizontal: 5,
    */
    marginBottom: 10,
  },
  editText: {
    fontFamily: "AzeretMono_400Regular",
    color: "white",
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#023969',
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 32,
    borderRadius: 40,
  },
  modalImage: {
    width: "100%",
    //height: 180,
    aspectRatio: 1.7,
    borderRadius: 16,
    resizeMode: "contain",
  },
  modalTitle: {
    textAlign: "center",
    marginTop: 10,
    fontFamily: "AzeretMono_700Bold",
  },
  modalLabel: {
    fontSize: 13,
    fontFamily: "AzeretMono_700Bold",
  },
  modalText: {
    fontSize: 10,
    fontFamily: "AzeretMono_400Regular",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 10,
    marginBottom: 10,
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    width: 120,
  },
  sliderLine: {
    flex: 1,
    height: 6,
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
  },
  sliderCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#023969",
  },
  priceText: {
    fontSize: 15,
    fontFamily: "AzeretMono_700Bold",
  },
  scrollViewDark: {
    backgroundColor: '#08111f',
  },
  analyticsSectionDark: {
    backgroundColor: '#121c2b',
    borderColor: '#2d3a4a',
  },
  cardDark: {
    backgroundColor: '#1d2d44',
  },
  sectionContainerDark: {
    backgroundColor: '#08111f',
  },
  suggestedSectionDark: {
    backgroundColor: '#08111f',
  },
  centerContainerDark: {
    backgroundColor: '#08111f',
  },
  emptyContainerDark: {
    backgroundColor: '#08111f',
  },
  modalContentDark: {
    backgroundColor: '#121c2b',
    borderWidth: 1,
    borderColor: '#2d3a4a',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  accentTextDark: {
    color: '#8bbcff',
  },
  bottomSpacer: {
    height: 100,
    backgroundColor: '#ffffff',
  },
  bottomSpacerDark: {
    backgroundColor: '#08111f',
  },
  textDark: {
    color: '#ffffff',
  },
  analyticsTitle: {
    marginLeft: 0,
    color: '#1a1a1a',
  },
  editButtonDark:{
    backgroundColor:'#024883',
  },
  modalImageDark: {
    backgroundColor: '#ffffff',
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "AzeretMono_400Regular",
  },
   analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsCollapsedHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#5f6f7a',
  },
  analyticsContent: {
    marginTop: 16,
  },
});
