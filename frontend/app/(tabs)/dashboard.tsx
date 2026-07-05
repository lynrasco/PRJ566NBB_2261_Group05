import { StyleSheet, ScrollView, Modal, View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardHeader } from '@/components/dashboard-header';
import { MainItemTile } from '@/components/main-item-tile';
import { ListItem } from '@/components/list-item';
import { useState, useCallback, useEffect } from 'react';
import { getAllItems, getDashboardAnalytics, getItemMarketAnalytics } from '@/services/api';
import AnalyticsSection from '@/components/analytics-section';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<any>(null);

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
    setSelectedItem(item);
    setModalVisible(true);
  };

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

  const recentItems = (summary.recentItems || []).slice(0, 4);

  return (
  <>
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Dashboard Header */}
      <DashboardHeader
        userName="Linda"
        profileImage={require('@/assets/images/profile-picture.png')}
      />

      {/* Loading State */}
      {loading && (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#024883" />
          <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
        </ThemedView>
      )}

      {/* Error State */}
      {error && !loading && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>⚠️ Error: {error}</ThemedText>
          <Pressable style={styles.retryButton} onPress={fetchItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </ThemedView>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No items found</ThemedText>
          <ThemedText style={styles.emptySubtext}>Start by uploading your first item</ThemedText>
        </ThemedView>
      )}

      {!loading && !error && (
        <ThemedView style={styles.analyticsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Analytics Overview
          </ThemedText>

          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCardPrimary}>
              <ThemedText style={styles.metricsLabel}>Saved Items</ThemedText>
              <ThemedText type="title" style={styles.metricsValue}>{summary.totalSavedItems}</ThemedText>
              <ThemedText style={styles.metricsHint}>Items in your collection</ThemedText>
            </View>

            <View style={styles.analyticsCardPrimary}>
              <ThemedText style={styles.metricsLabel}>Avg Suggested Price</ThemedText>
              <ThemedText type="title" style={styles.metricsValue}>
                {summary.averageSuggestedPrice ? `$${summary.averageSuggestedPrice}` : '$0'}
              </ThemedText>
              <ThemedText style={styles.metricsHint}>Across current suggestions</ThemedText>
            </View>
          </View>

          <View style={styles.analyticsGridTwo}>
            <View style={styles.analyticsCardSecondary}>
              <ThemedText style={styles.metricsLabel}>Category Mix</ThemedText>
              {categoryEntries.length > 0 ? categoryEntries.map(([label, count]) => (
                <View key={label} style={styles.breakdownRow}>
                  <ThemedText style={styles.breakdownLabel}>{label}</ThemedText>
                  <ThemedText style={styles.breakdownValue}>{count}</ThemedText>
                </View>
              )) : (
                <ThemedText style={styles.emptyBreakdown}>No categories yet</ThemedText>
              )}
            </View>

            <View style={styles.analyticsCardSecondary}>
              <ThemedText style={styles.metricsLabel}>Condition Mix</ThemedText>
              {conditionEntries.length > 0 ? conditionEntries.map(([label, count]) => (
                <View key={label} style={styles.breakdownRow}>
                  <ThemedText style={styles.breakdownLabel}>{label}</ThemedText>
                  <ThemedText style={styles.breakdownValue}>{count}</ThemedText>
                </View>
              )) : (
                <ThemedText style={styles.emptyBreakdown}>No condition data yet</ThemedText>
              )}
            </View>
          </View>

          <View style={styles.marketCard}>
            <ThemedText style={styles.metricsLabel}>Market Snapshot</ThemedText>
            <ThemedText style={styles.marketValue}>
              {marketAnalytics?.comparablesCount ?? summary.marketplaceComparables ?? 0} comparable listings
            </ThemedText>
            <ThemedText style={styles.marketHint}>
              Avg {marketAnalytics?.averageMarketPrice ? `$${marketAnalytics.averageMarketPrice}` : '$0'} • Low {marketAnalytics?.lowestMarketPrice ? `$${marketAnalytics.lowestMarketPrice}` : '$0'} • High {marketAnalytics?.highestMarketPrice ? `$${marketAnalytics.highestMarketPrice}` : '$0'}
            </ThemedText>
          </View>

           <AnalyticsSection
              categoryBreakdown={summary.categoryBreakdown}
              conditionBreakdown={summary.conditionBreakdown}
            />

        </ThemedView>
      )}

      {/* Main Item Tile - First Item (Featured) */}
      {!loading && !error && items.length > 0 && (
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#1a1a1a', marginBottom: 5}]}>
            Previous Listing
          </ThemedText>
          <MainItemTile
            title={items[0].title || 'Untitled'}
            brand={items[0].brand}
            priceRange={items[0].price ? `$${items[0].price}` : 'Price TBD'}
            description={items[0].description}
            image={items[0].imageUrl}
            onPress={() => handleItemPress(items[0])}
          />
        </ThemedView>
      )}

      {!loading && !error && recentItems.length > 0 && (
        <ThemedView style={styles.suggestedSection}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#1a1a1a' }]}>
            Recent Activity
          </ThemedText>

          {recentItems.map((item: any, index: number) => (
            <ListItem
              key={item._id || item.id || index}
              title={item.title || 'Untitled'}
              price={item.price ? `$${item.price}` : 'Price TBD'}
              description={item.description || item.category || item.condition}
              image={item.imageUrl}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </ThemedView>
      )}

      {/* Suggested Listings - Remaining Items */}
      {!loading && !error && items.length > 1 && (
        <ThemedView style={styles.suggestedSection}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#1a1a1a' }]}>
            Suggested Listings
          </ThemedText>

          {items.slice(1).map((item, index) => (
            <ListItem
              key={item._id || index}
              title={item.title || 'Untitled'}
              price={item.price ? `$${item.price}` : 'Price TBD'}
              description={item.description}
              image={item.imageUrl}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </ThemedView>
      )}

      <ThemedView style={{ height: 100, backgroundColor: '#ffffff' }} />
    </ScrollView>

    {/* Item Detail Modal */}
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill} 
          onPress={() => setModalVisible(false)}
        />
         <View style={styles.modalContent}>

          <View style={styles.modalBar}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="trash-outline" size={25} color="black" />
            </Pressable>

            <Pressable style={styles.editButton} 
              hitSlop={15}
              onPress={() => {
              setModalVisible(false);
              if (selectedItem) {
                router.push({
                  pathname: '/edit-item',
                  params: {
                    itemId: selectedItem._id,
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
              <ThemedText type="default" style={{fontSize: 12}}>Edit</ThemedText>
            </Pressable>
          </View>
          {selectedItem?.imageUrl && (
            <Image source={{ uri: selectedItem.imageUrl }} style={styles.modalImage} />
          )}

          <ThemedText type="defaultSemiBold" style={{color: '#000', fontSize: 13, textAlign: 'center', marginBottom: 12}}>{selectedItem?.title}</ThemedText>
          {selectedItem?.brand && (
            <>
              <ThemedText type="defaultSemiBold" style={{color: '#000', fontSize: 13}}>Brand:</ThemedText>
              <ThemedText type="default" style={{color: '#000', fontSize: 10, marginBottom: 10, lineHeight: 11}}>{selectedItem.brand}</ThemedText>
            </>
          )}
          {selectedItem?.category && (
            <>
              <ThemedText type="defaultSemiBold" style={{color: '#000', fontSize: 13}}>Category:</ThemedText>
              <ThemedText type="default" style={{color: '#000', fontSize: 10, marginBottom: 10, lineHeight: 11}}>{selectedItem.category}</ThemedText>
            </>
          )}
          {selectedItem?.description && (
            <>
              <ThemedText type="defaultSemiBold" style={{color: '#000', fontSize: 13}}>Description:</ThemedText>
              <ThemedText type="default" style={{color: '#000', fontSize: 10, marginBottom: 10, lineHeight: 11}}>{selectedItem.description}</ThemedText>
            </>
          )}
          {selectedItem?.condition && (
            <>
              <ThemedText type="defaultSemiBold" style={{color: '#000', fontSize: 13}}>Condition:</ThemedText>
              <ThemedText type="default" style={{color: '#000', fontSize: 10, marginBottom: 10, lineHeight: 11}}>{selectedItem.condition}</ThemedText>
            </>
          )}
          {selectedItem?.price && (
            <>
              <ThemedText type="defaultSemiBold" style={{color: '#000', fontSize: 13}}>Price:</ThemedText>
              <ThemedText type="default" style={{color: '#000', fontSize: 10, marginBottom: 10, lineHeight: 11}}>${selectedItem.price}</ThemedText>
            </>
          )}
        </View>
      </View>
    </Modal>
    </>
  );
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
  }
});

