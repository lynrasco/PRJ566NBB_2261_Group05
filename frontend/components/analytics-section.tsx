//import { StyleSheet, View } from 'react-native';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type BreakdownData = Record<string, number>;

type AnalyticsSectionProps = {
  categoryBreakdown?: BreakdownData;
  conditionBreakdown?: BreakdownData;
};

export default function AnalyticsSection({
  categoryBreakdown = {},
  conditionBreakdown = {},
}: AnalyticsSectionProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.chartTitle}>Analytics Charts</ThemedText>

      <ChartCard
        title="Category Breakdown"
        data={categoryBreakdown}
        emptyText="No category data yet"
      />

      <ChartCard
        title="Condition Breakdown"
        data={conditionBreakdown}
        emptyText="No condition data yet"
      />
    </View>
  );
}

function ChartCard({
  title,
  data,
  emptyText,
}: {
  title: string;
  data: BreakdownData;
  emptyText: string;
}) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const maxValue = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <View style={styles.chartCard}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>

      {entries.length > 0 ? (
        entries.map(([label, count]) => {
          //const barWidth = `${Math.max(8, (count / maxValue) * 100)}%`;
          const barWidth: DimensionValue = `${Math.max(8, (count / maxValue) * 100)}%`;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <View key={label} style={styles.chartRow}>
              <View style={styles.chartHeader}>
                <ThemedText numberOfLines={1} style={styles.chartLabel}>
                  {label}
                </ThemedText>

                <ThemedText style={styles.chartValue}>
                  {count} ({percentage}%)
                </ThemedText>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: barWidth }]} />
              </View>
            </View>
          );
        })
      ) : (
        <ThemedText style={styles.emptyText}>{emptyText}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#30404d',
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5f6f7a',
    marginBottom: 8,
  },
  chartRow: {
    marginBottom: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  chartLabel: {
    flex: 1,
    fontSize: 12,
    color: '#30404d',
  },
  chartValue: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#024883',
  },
  barTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#dce7f2',
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#024883',
  },
  emptyText: {
    fontSize: 12,
    color: '#7b8793',
    marginTop: 4,
  },
});