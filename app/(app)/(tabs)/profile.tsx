import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("Select Date of Birth");
  const [aadhar, setAadhar] = useState<string | null>(null);
  const [license, setLicense] = useState<string | null>(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Function to take the main profile selfie
  const handleTakeSelfie = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Denied",
        "You've refused to allow this app to access your camera."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    // Clear all the stored authentication data
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("userName");
    await SecureStore.deleteItemAsync("userEmail");

    // Navigate the user back to the login screen
    router.replace("/login");
  };

  // --- Correctly Structured Document Handling Functions ---

  // This function now correctly sits at the top level of the component
  const showDocumentOptions = (docType: "aadhar" | "license") => {
    Alert.alert(
      `Upload ${docType === "aadhar" ? "Aadhar" : "License"}`,
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takeDocPhoto(docType),
        },
        {
          text: "Choose from Library",
          onPress: () => chooseDocFromLibrary(docType),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const takeDocPhoto = async (docType: "aadhar" | "license") => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Denied",
        "You've refused to allow this app to access your camera."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (docType === "aadhar") setAadhar(result.assets[0].uri);
      else setLicense(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedName = await SecureStore.getItemAsync("userName");
        const storedEmail = await SecureStore.getItemAsync("userEmail");

        if (storedName) {
          setName(storedName);
        }
        if (storedEmail) {
          setEmail(storedEmail);
        }
      } catch (e) {
        console.error("Failed to load user data:", e);
      }
    };

    loadUserData();
  }, []);

  const chooseDocFromLibrary = async (docType: "aadhar" | "license") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need access to your photos to upload documents."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      if (docType === "aadhar") setAadhar(result.assets[0].uri);
      else setLicense(result.assets[0].uri);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    setDob(date.toLocaleDateString("en-GB"));
    hideDatePicker();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={handleTakeSelfie}
            style={styles.avatarContainer}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <Ionicons name="camera" size={40} color="#0D47A1" />
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="add-circle" size={24} color="#0D47A1" />
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Your Name</Text>
            <View style={styles.verifiedStatus}>
              <MaterialIcons name="verified" size={16} color="#ccc" />
              <Text style={styles.verifiedText}>Not Verified</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text
              style={
                dob === "Select Date of Birth"
                  ? styles.placeholderText
                  : styles.inputText
              }
            >
              {dob}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <DocumentPicker
            title="Aadhar Card"
            imageUri={aadhar}
            onPick={() => showDocumentOptions("aadhar")}
          />
          {/* Corrected the typo here */}
          <DocumentPicker
            title="Driving License"
            imageUri={license}
            onPick={() => showDocumentOptions("license")}
          />
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Details</Text>
        </TouchableOpacity>

        {/* Add this temporary logout button */}
        <TouchableOpacity
          style={[styles.saveButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.saveButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
}

// --- Helper component (remains the same) ---
const DocumentPicker = ({
  title,
  imageUri,
  onPick,
}: {
  title: string;
  imageUri: string | null;
  onPick: () => void;
}) => (
  <TouchableOpacity style={styles.docPicker} onPress={onPick}>
    {imageUri ? (
      <Image source={{ uri: imageUri }} style={styles.docPreview} />
    ) : (
      <>
        <Ionicons name="cloud-upload-outline" size={30} color="#0D47A1" />
        <Text style={styles.docPickerText}>Upload {title}</Text>
      </>
    )}
  </TouchableOpacity>
);

// --- Styles (remains the same) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f6f8" },
  container: { padding: 20 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0D47A1",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 50 },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
  },
  userInfo: { marginLeft: 20 },
  userName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  verifiedStatus: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  verifiedText: { marginLeft: 5, color: "#aaa", fontStyle: "italic" },
  formSection: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    height: 55,
  },
  inputText: { fontSize: 16 },
  placeholderText: { fontSize: 16, color: "#999" },
  docPicker: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 10,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  docPreview: { width: "100%", height: "100%", borderRadius: 8 },
  docPickerText: { marginTop: 5, color: "#555" },
  saveButton: {
    backgroundColor: "#0D47A1",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  logoutButton: {
    backgroundColor: "#C62828", // A red color for logout
    marginTop: 15,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 55,
    marginBottom: 10,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 15,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    padding: 15,
  },
});
