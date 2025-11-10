import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { searchVehiclesApi } from "../../src/api"; // Our new API function
import { useApi } from "../../src/useApi"; // Your useApi hook

// A new component to render each scooter
const ScooterCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{ uri: item.photos[0] || "https://via.placeholder.com/150" }} // Added placeholder
      style={styles.cardImage}
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.scootyModel}</Text>
      <Text style={styles.cardLocation}>{item.location}</Text>
      <View style={styles.hostInfo}>
        <Image
          source={{
            uri: item.host?.profile?.photo || "https://via.placeholder.com/50",
          }} // Added placeholder
          style={styles.hostImage}
        />
        <Text style={styles.hostName}>{item.host?.name || "Host"}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function SearchResultsScreen() {
  const router = useRouter();
  // 1. Get the parameters from the home screen
  const { city, pickup, drop } = useLocalSearchParams() as {
    city: string;
    pickup: string;
    drop: string;
  };

  // 2. Setup the API call
  const {
    data: vehiclesData,
    isLoading,
    error,
    request: fetchVehicles,
  } = useApi(searchVehiclesApi);

  // 3. Call the API when the screen loads
  useEffect(() => {
    if (city && pickup && drop) {
      fetchVehicles({ city, pickup, drop });
    }
  }, [city, pickup, drop]);

  // 4. Format the dates for display
  const pickupDate = new Date(pickup).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const dropDate = new Date(drop).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });

  // 5. Handle different states (loading, error, success)
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.infoContainer}>
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text style={styles.infoText}>Finding available scooters...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Error: {error}</Text>
        </View>
      );
    }

    if (!vehiclesData?.data || vehiclesData.data.length === 0) {
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            No scooters found for these criteria.
          </Text>
        </View>
      );
    }

    // 6. This is the FlatList that shows the results
    return (
      <FlatList
        data={vehiclesData.data}
        renderItem={({ item }) => (
          <ScooterCard
            item={item}
            onPress={() => {
              // --- THIS IS THE FIX ---
              router.push({
                pathname: "/vehicle/[id]", // Use the file-system template name
                params: {
                  id: item._id, // Pass the 'id' as a param
                  pickup, // Pass the pickup date
                  drop, // Pass the drop date
                },
              });
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: `Scooters in ${city.split(",")[0]}` }} />

      <View style={styles.content}>
        {/* Header showing the search query */}
        <View style={styles.paramsContainer}>
          <Text style={styles.paramText}>
            <Ionicons name="time-outline" size={16} /> {pickupDate} to{" "}
            {dropDate}
          </Text>
        </View>

        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  paramsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paramText: { fontSize: 16, color: "#555", lineHeight: 24, fontWeight: "500" },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  infoText: { marginTop: 15, fontSize: 16, color: "#666" },

  // Scooter Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    width: 120,
    height: "100%",
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },
  hostImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  hostName: {
    fontSize: 14,
    color: "#555",
  },
  priceContainer: {
    padding: 15,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  priceLabel: {
    fontSize: 14,
    color: "#0D47A1",
    marginTop: -4,
  },
});
