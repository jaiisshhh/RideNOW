import { Ionicons } from "@expo/vector-icons"; // Added MaterialCommunityIcons
import * as WebBrowser from "expo-web-browser";
import { MotiView } from "moti"; // 2. Imported Moti
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 3. Fixed SafeAreaView import

// --- 🛑 ACTION REQUIRED ---
const RIDE_NOW_LOGO_PATH = require("../../../src/assets/logo.png"); // Check path
const BECOME_HOST_URL = "https://ride-now-frontend.vercel.app/host"; // Change this URL
// --------------------------

export default function HostScreen() {
  const handlePress = () => {
    WebBrowser.openBrowserAsync(BECOME_HOST_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 4. Added ScrollView */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* The RideNow Logo */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <Image source={RIDE_NOW_LOGO_PATH} style={styles.logo} />
        </MotiView>

        {/* The Text */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
        >
          <Text style={styles.title}>Become a Host with RideNow</Text>
          <Text style={styles.description}>
            {/* 5. Changed "car" to "scooty or bike" */}
            Turn your scooty or bike into an earning machine. Share it when
            you're not using it and join thousands earning passive income.
          </Text>
        </MotiView>

        {/* 6. NEW: "Why Host?" Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
          style={styles.benefitsContainer}
        >
          <BenefitCard
            icon="wallet-outline"
            title="Earn Extra Income"
            description="Make money from your two-wheeler when you're not even using it."
          />
          <BenefitCard
            icon="shield-checkmark-outline"
            title="We've Got You Covered"
            description="Our insurance policy and 24/7 support mean you can host with peace of mind."
          />
          <BenefitCard
            icon="calendar-outline"
            title="You're in Control"
            description="Set your own prices, availability, and rules. Host on your terms."
          />
        </MotiView>

        {/* The "Become Host" Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 600 }}
        >
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Start Earning Today</Text>
            <Ionicons
              name="open-outline"
              size={20}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

// 7. NEW: Helper component for benefit cards
const BenefitCard = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <View style={styles.benefitCard}>
    <View style={styles.benefitIconContainer}>
      <Ionicons name={icon} size={24} color="#0D47A1" />
    </View>
    <View style={styles.benefitTextContainer}>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDescription}>{description}</Text>
    </View>
  </View>
);

// 8. UPDATED STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flexGrow: 1, // Changed from flex: 1
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20, // Added vertical padding
  },
  logo: {
    width: 120, // Slightly smaller
    height: 120, // Slightly smaller
    resizeMode: "contain",
    marginBottom: 30, // Reduced margin
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30, // Reduced margin
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#0D47A1",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 10, // Added margin top
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // --- NEW STYLES FOR BENEFITS ---
  benefitsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  benefitCard: {
    backgroundColor: "#f4f6f8", // Light background
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  benefitIconContainer: {
    backgroundColor: "#e9eef2",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});
