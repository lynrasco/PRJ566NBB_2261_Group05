import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnalyticsSection() {
  const analytics = {
    totalSavedItems: 12,
    averageSuggestedPrice: 67,
    marketplaceComparables: 34,
    categoryBreakdown: {
      Footwear: 5,
      Accessories: 3,
      Outerwear: 4,
    },
    conditionBreakdown: {
      New: 6,
      Used: 4,
      'Like New': 2,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={18} color="#024883" />
          <Text style={styles.statValue}>{analytics.totalSavedItems}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={18} color="#024883" />
          <Text style={styles.statValue}>${analytics.averageSuggestedPrice}</Text>
          <Text style={styles.statLabel}>Avg Price</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="pricetag-outline" size={18} color="#024883" />
          <Text style={styles.statValue}>{analytics.marketplaceComparables}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>

        {Object.entries(analytics.categoryBreakdown).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.rowLabel}>{key}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Condition Breakdown</Text>
        {Object.entries(analytics.conditionBreakdown).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.rowLabel}>{key}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 18,
    color: '#061421',
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    marginTop: 6,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    color: '#024883',
  },
  statLabel: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 10,
    color: '#58708b',
  },

  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 14,
    marginBottom: 10,
    color: '#061421',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowLabel: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    color: '#49617a',
  },
  rowValue: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    color: '#024883',
  },
});