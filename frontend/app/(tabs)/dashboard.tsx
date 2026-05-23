import { StyleSheet, ScrollView, Modal, View, Text, Pressable, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardHeader } from '@/components/dashboard-header';
import { MainItemTile } from '@/components/main-item-tile';
import { ListItem } from '@/components/list-item';
import { useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { AzeretMono_400Regular, AzeretMono_700Bold } from '@expo-google-fonts/azeret-mono';
import Slider from '@react-native-community/slider';

export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [price, setPrice] = useState(57);

  return (
  <>
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
          //onPress={() => alert('Previous listing pressed')}
          onPress={() => setModalVisible(true)}
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

    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => setModalVisible(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <View style={styles.modalBar}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="trash-outline" size={25} color="black" />
              </Pressable>

            <Pressable style={styles.editButton} onPress={() => alert("edit item preview UI here")}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <Image source={require('@/assets/images/partial-react-logo.png')} style={styles.modalImage}/>

          <Text style={styles.modalTitle}>Visible Black{"\n"}by SM{"\n"}</Text>
          <Text style={styles.modalLabel}>Brand:</Text>
          <Text style={styles.modalText}>Steve Madden{"\n"}</Text>
          <Text style={styles.modalLabel}>Category:</Text>
          <Text style={styles.modalText}>FootWear{"\n"}</Text>
          <Text style={styles.modalLabel}>Description:</Text>
          <Text style={styles.modalText}>
            Elegant black heels designed to provide both style and confidence. Featuring a sleek shape and comfortable fit, these heels are perfect for formal events, office wear, or a night out. The timeless black color ensures they complement any outfit effortlessly.{"\n"}
          </Text>
          <Text style={styles.modalLabel}>Price Range:</Text>

          <View style={styles.rangeRow}>
            <Text style={styles.priceText}>$57</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.sliderCircle} />
              <View style={styles.sliderLine} />
              <View style={styles.sliderCircle} />
            </View>
            <Text style={styles.priceText}>$70</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    </>
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
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    paddingHorizontal: 5,
  },
  editText: {
    fontFamily: "AzeretMono_400Regular",
    color: "white",
  },
  editButton: {
    backgroundColor: '#023969',
    alignItems: "center",
    justifyContent: "center",
    width: 69,
    height: 25,
    borderRadius: 40,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: "center",
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
