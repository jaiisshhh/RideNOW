import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { endBookingApi, getUserBookingsApi } from "../../src/api";
import { useAuth } from "../../src/context/AuthContext";
import { useApi } from "../../src/useApi";

// --- Booking Card Component ---
const BookingCard = ({
  item,
  onEndBooking,
}: {
  item: any;
  onEndBooking: (vehicleId: string) => void;
}) => {
  const isActive = item.bookingStatus === "confirmed";

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.photos[0] || "https://via.placeholder.com/150" }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.scootyModel}</Text>
        <Text style={styles.cardLocation}>{item.location}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.startDate).toLocaleDateString()} -{" "}
          {new Date(item.endDate).toLocaleDateString()}
        </Text>

        {/* --- Status / Action Button --- */}
        {isActive ? (
          <TouchableOpacity
            style={styles.endButton}
            onPress={() => onEndBooking(item.vehicleId)}
          >
            <Text style={styles.endButtonText}>End Booking</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.statusText}>{item.bookingStatus}</Text>
        )}
      </View>
    </View>
  );
};

// --- Main Page Component ---
export default function BookingHistoryScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth(); // We'll update the user

  // API hook for fetching history
  const {
    data: historyData,
    isLoading,
    error,
    request: fetchHistory,
  } = useApi(getUserBookingsApi);

  // API hook for ending a booking
  const { isLoading: isEnding, request: endBooking } = useApi(endBookingApi);

  // Fetch history when the screen loads
  useEffect(() => {
    fetchHistory({});
  }, []);

  const handleEndBooking = (vehicleId: string) => {
    Alert.alert("End Booking", "Are you sure you want to end this booking?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, End It",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await endBooking(vehicleId);
            if (result.success) {
              // Update the user's global state
              await updateUser({ ...user, isBookedVehicle: false });
              // Refresh the list
              fetchHistory({});
              Alert.alert("Success", "Booking ended.");
            }
          } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to end booking.");
          }
        },
      },
    ]);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.infoContainer}>
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text style={styles.infoText}>Loading your history...</Text>
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

    if (!historyData?.data || historyData.data.length === 0) {
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>You have no booking history.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={historyData.data}
        renderItem={({ item }) => (
          <BookingCard item={item} onEndBooking={handleEndBooking} />
        )}
        keyExtractor={(item) => item.vehicleId + item.startDate}
        contentContainerStyle={{ padding: 20 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Booking History" }} />
      {renderContent()}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
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
    width: 110,
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
  },
  cardLocation: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  cardDate: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  endButton: {
    backgroundColor: "#C62828", // Red color
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  endButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32", // Green color
    marginTop: 12,
  },
});
