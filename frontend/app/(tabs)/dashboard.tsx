import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardHeader } from '@/components/dashboard-header';
import { MainItemTile } from '@/components/main-item-tile';
import { ListItem } from '@/components/list-item';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Dashboard Header */}
      <DashboardHeader
        userName="Linda"
        profileImage={require('@/assets/images/partial-react-logo.png')}
      />

      {/* Main Item Tile - Previous Listing */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#1a1a1a' }]}>Previous Listing</ThemedText>
        <MainItemTile
          title="Viable Black by SM"
          priceRange="$57 - $70"
          description="Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          image={require('@/assets/images/partial-react-logo.png')}
          onPress={() => alert('Previous listing pressed')}
        />
      </ThemedView>

      {/* Suggested Listings */}
      <ThemedView style={styles.suggestedSection}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#1a1a1a' }]}>Suggested Listings</ThemedText>
        
        <ListItem
          title="Burgundy bag"
          price="$351"
          description="Lorem ipsum dolor sit amet consectetur adipiscing elit."
          image={require('@/assets/images/partial-react-logo.png')}
          onPress={() => alert('Burgundy bag pressed')}
        />

        <ListItem
          title="Zara Jacket"
          price="$58"
          description="Lorem ipsum dolor sit amet consectetur adipiscing elit."
          image={require('@/assets/images/partial-react-logo.png')}
          onPress={() => alert('Zara Jacket pressed')}
        />

        <ListItem
          title="Prada Glasses"
          price="$103"
          description="Lorem ipsum dolor sit amet consectetur adipiscing elit."
          image={require('@/assets/images/partial-react-logo.png')}
          onPress={() => alert('Prada Glasses pressed')}
        />
      </ThemedView>

      <ThemedView style={{ height: 100, backgroundColor: '#ffffff' }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
});
