import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { bookVehicleApi, getVehiclePriceApi } from "../../../src/api";
import { useAuth } from "../../../src/context/AuthContext";
import { useApi } from "../../../src/useApi";

export default function VehicleDetailsScreen() {
  const router = useRouter();
  const { updateUser } = useAuth(); // To update user's booking status

  // Get all params from the URL
  const {
    id: vehicleId,
    pickup,
    drop,
  } = useLocalSearchParams() as {
    id: string;
    pickup: string;
    drop: string;
  };

  // Setup API call for getting price
  const {
    data: priceData,
    isLoading: isLoadingPrice,
    error: priceError,
    request: fetchPrice,
  } = useApi(getVehiclePriceApi);

  // Setup API call for booking
  const {
    isLoading: isBooking,
    error: bookError,
    request: performBooking,
  } = useApi(bookVehicleApi);

  // Fetch price when screen loads
  useEffect(() => {
    if (vehicleId && pickup && drop) {
      fetchPrice({ vehicleId, pickup, drop });
    }
  }, [vehicleId, pickup, drop]);

  const handleBooking = async () => {
    const price = priceData?.data.pricingDetails?.total_price_estimate;
    if (!price) {
      Alert.alert("Error", "Cannot book without a price estimate.");
      return;
    }

    try {
      const result = await performBooking({
        vehicleId,
        startDate: pickup,
        endDate: drop,
        totalPrice: price,
      });

      if (result.success) {
        // Refresh the user's data to set 'isBookedVehicle = true'
        // (Assuming your /book endpoint returns the updated user)
        // If not, we'd need to re-fetch the user here.

        Alert.alert("Success!", "Your scooter is booked.");
        router.push("/(app)/(tabs)/home"); // Go to home (or a 'my bookings' tab)
      }
    } catch (e: any) {
      // The useApi hook already sets the error, but we can alert it
      Alert.alert("Booking Failed", e.message || "An unknown error occurred.");
    }
  };

  if (isLoadingPrice) {
    return (
      <View style={styles.infoContainer}>
        <ActivityIndicator size="large" color="#0D47A1" />
        <Text style={styles.infoText}>Getting details and price...</Text>
      </View>
    );
  }

  if (priceError || !priceData?.data) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {priceError || "Could not load vehicle details."}
        </Text>
      </View>
    );
  }

  const { vehicleDetails: vehicle, pricingDetails: price } = priceData.data;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen options={{ title: vehicle.scootyModel }} />
      <ScrollView>
        <Image source={{ uri: vehicle.photos[0] }} style={styles.headerImage} />

        <View style={styles.content}>
          <Text style={styles.title}>{vehicle.scootyModel}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={16} /> {vehicle.location}
          </Text>

          <View style={styles.hostInfo}>
            <Image
              source={{ uri: vehicle.host?.profile?.photo }}
              style={styles.hostImage}
            />
            <Text>Hosted by {vehicle.host?.name}</Text>
          </View>

          {/* Pricing Info */}
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Total Estimated Price</Text>
            <Text style={styles.priceText}>
              {/* Added '?' to prevent crash if data is missing */}₹
              {price?.total_price_estimate?.toFixed(2) || "N/A"}
            </Text>
            <Text style={styles.priceSubtext}>
              ({price?.total_days || "N/A"} days @ ~₹
              {price?.average_daily_price?.toFixed(2) || "N/A"}/day)
            </Text>
          </View>

          {/* Booking Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <Text style={styles.summaryText}>
              From: {new Date(pickup).toLocaleString()}
            </Text>
            <Text style={styles.summaryText}>
              To: {new Date(drop).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Button Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
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
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  location: {
    fontSize: 18,
    color: "#555",
    marginTop: 5,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  hostImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  priceBox: {
    backgroundColor: "#f4f6f8",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  priceText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0D47A1",
    marginVertical: 5,
  },
  priceSubtext: {
    fontSize: 14,
    color: "#777",
  },
  summaryBox: {
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  bookButton: {
    backgroundColor: "#0D47A1",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#aaa",
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
