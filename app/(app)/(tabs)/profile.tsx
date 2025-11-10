import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../src/context/AuthContext"; // 1. Import useAuth

export default function ProfileViewScreen() {
  const router = useRouter();
  const { user } = useAuth(); // 3. Get the user object from our global context!

  // 4. All the useApi and useEffect logic is GONE.

  // 5. Check if the user is somehow null (shouldn't happen, but good to check)
  if (!user) {
    // This can happen for a split second on logout
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Helper function to get document status
  const getDocStatus = (
    docType: "Aadhar" | "DL"
  ): {
    text: string;
    color: string;
    verified: boolean;
  } => {
    if (!user.verifiedDoc || user.verifiedDoc.length === 0) {
      return { text: "Not Uploaded", color: "#C62828", verified: false };
    }

    // Find the specific document in the array
    const doc = user.verifiedDoc.find((d: any) => d.docType === docType);

    if (!doc) {
      return { text: "Not Uploaded", color: "#C62828", verified: false };
    }

    switch (doc.status) {
      case "approved":
        return { text: "Verified", color: "#2E7D32", verified: true };
      case "pending":
        return { text: "Pending Review", color: "#FF8F00", verified: false };
      case "rejected":
        return { text: "Rejected", color: "#C62828", verified: false };
      default:
        return { text: "Not Verified", color: "#C62828", verified: false };
    }
  };

  const aadharStatus = getDocStatus("Aadhar");
  const dlStatus = getDocStatus("DL");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {/* 6. Use the 'user' object from context */}
            {user.profile?.photo ? (
              <Image
                source={{ uri: user.profile.photo }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person" size={50} color="#0D47A1" />
              </View>
            )}
          </View>

          {/* 7. Use the 'user' object from context */}
          <Text style={styles.userName}>{user.name || "RideNow User"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Status</Text>
          <VerificationRow
            label="Email Verification"
            isVerified={user.isEmailVerified}
            onVerify={() =>
              Alert.alert("Email Verification", "This email is verified.")
            }
          />
          <VerificationRow
            label="Phone Verification"
            isVerified={user.isPhoneVerified}
            onVerify={() =>
              Alert.alert(
                "Phone Verification",
                "Navigate to phone verify flow."
              )
            }
          />
          <VerificationRow
            label="Aadhar Card"
            isVerified={aadharStatus.verified}
            statusText={aadharStatus.text}
            statusColor={aadharStatus.color}
            onVerify={() => router.push("/editProfile")} // Send to upload
          />
          <VerificationRow
            label="Driving License"
            isVerified={dlStatus.verified}
            statusText={dlStatus.text}
            statusColor={dlStatus.color}
            onVerify={() => router.push("/editProfile")} // Send to upload
          />
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <OptionRow
            icon="receipt-outline" // New icon
            label="Booking History" // New label
            onPress={() => router.push("/booking-history")} // New action
          />
          <OptionRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
          <OptionRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- HELPER COMPONENTS (Unchanged) ---

const VerificationRow = ({
  label,
  isVerified,
  statusText,
  statusColor,
  onVerify,
}: {
  label: string;
  isVerified: boolean;
  statusText?: string;
  statusColor?: string;
  onVerify: () => void;
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Feather
        name={isVerified ? "check-circle" : "alert-circle"}
        size={22}
        color={isVerified ? "#2E7D32" : "#C62828"}
      />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <TouchableOpacity onPress={onVerify}>
      <Text
        style={[
          styles.rowStatus,
          { color: statusColor || (isVerified ? "#2E7D32" : "#0D47A1") },
        ]}
      >
        {statusText || (isVerified ? "Verified" : "Verify Now")}
      </Text>
    </TouchableOpacity>
  </View>
);

const OptionRow = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowLeft}>
      <Ionicons name={icon} size={22} color="#555" />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#999" />
  </TouchableOpacity>
);

// --- STYLES (Unchanged) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f6f8" },
  container: { paddingBottom: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e9eef2",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#777",
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  rowStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
});
