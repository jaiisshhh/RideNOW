import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker"; // The new package for PDFs
import * as ImagePicker from "expo-image-picker"; // We still need this for the Profile Photo
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import api, { verifyAadharApi, verifyDLApi } from "../../src/api";
import { useAuth } from "../../src/context/AuthContext";
import { useApi } from "../../src/useApi";

// ## API FUNCTION DEFINITIONS ##
// These are all the API calls this screen makes
const getUserProfileApi = () => api.get("/users/current-user");
const updateUserProfileApi = (data: any) => api.patch("/profile/update", data); // From rentuserprofile.app.controller
const uploadProfilePhotoApi = (formData: FormData) =>
  api.post("/profile/upload-photo", formData, {
    // From rentuserprofile.app.controller
    headers: { "Content-Type": "multipart/form-data" },
  });

export default function EditProfileScreen() {
  const router = useRouter();
  const auth = useAuth();

  // ## STATE MANAGEMENT ##
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // --- NEW STATE FOR DOC STATUS ---
  const [aadharStatus, setAadharStatus] = useState("Not Uploaded");
  const [dlStatus, setDlStatus] = useState("Not Uploaded");

  // ## API HOOKS ##
  const {
    data: userData,
    isLoading: isFetching,
    request: fetchUser,
  } = useApi(getUserProfileApi);
  const {
    isLoading: isUpdating,
    error: updateError,
    request: updateUser,
  } = useApi(updateUserProfileApi);
  const {
    isLoading: isUploadingPhoto,
    error: uploadPhotoError,
    request: uploadPhoto,
  } = useApi(uploadProfilePhotoApi);

  // --- UPDATED API HOOKS FOR DOCS ---
  const { isLoading: isUploadingAadhar, request: uploadAadhar } =
    useApi(verifyAadharApi);
  const { isLoading: isUploadingLicense, request: uploadLicense } =
    useApi(verifyDLApi);

  // ## EFFECTS ##
  // Fetch user data when the screen first loads
  useEffect(() => {
    fetchUser({});
  }, []);

  // When user data is fetched, populate the form state
  useEffect(() => {
    if (userData?.success && userData.data) {
      const user = userData.data;
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setProfileImage(user.profile?.photo || null);
      setDob(user.dob ? new Date(user.dob).toISOString().split("T")[0] : "");

      // --- NEW LOGIC TO SET DOC STATUS ---
      const aadharDoc = user.verifiedDoc?.find(
        (d: any) => d.docType === "Aadhar"
      );
      const dlDoc = user.verifiedDoc?.find((d: any) => d.docType === "DL");

      setAadharStatus(aadharDoc?.status || "Not Uploaded");
      setDlStatus(dlDoc?.status || "Not Uploaded");
    }
  }, [userData]);

  // ## HANDLERS ##
  const handleSaveChanges = async () => {
    const updatedData = { name, phone, dob };
    try {
      const result = await updateUser(updatedData);
      if (result.success) {
        Alert.alert("Success", "Your profile has been updated!");
        await auth.updateUser(result.data);
        router.back();
      }
    } catch (e) {
      console.log("Update failed, error is displayed to user.");
    }
  };

  const handleTakeSelfie = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets) {
      const localUri = result.assets[0].uri;
      setProfileImage(localUri); // Update local UI immediately

      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename!);
      const type = match ? `image/${match[1]}` : `image`;
      const formData = new FormData();
      formData.append("photo", { uri: localUri, name: filename, type } as any);

      try {
        // This 'uploadPhoto' is your useApi hook
        const photoResult = await uploadPhoto(formData);

        if (photoResult.success) {
          Alert.alert("Success", "Profile photo updated!");

          // --- THIS IS THE FIX ---
          // 'photoResult.data' is { photo: "new_url.jpg" }
          // We merge this with the user in our global AuthContext
          const updatedUser = {
            ...auth.user,
            profile: {
              ...auth.user.profile,
              photo: photoResult.data.photo,
            },
          };
          // Update the global context
          await auth.updateUser(updatedUser);
          // --- END OF FIX ---
        }
      } catch (e: any) {
        Alert.alert(
          "Upload Failed",
          e.message || "Could not update profile photo."
        );
      }
    }
  };

  // --- NEW HANDLER FOR PICKING PDF DOCUMENTS ---
  const handlePickDocument = async (docType: "aadhar" | "license") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // Only allow PDFs
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      // Create FormData
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType,
      } as any);

      // Set loading state
      if (docType === "aadhar") setAadharStatus("Uploading...");
      else setDlStatus("Uploading...");

      // Call the correct API
      const uploadFn = docType === "aadhar" ? uploadAadhar : uploadLicense;
      const apiResult = await uploadFn(formData);

      if (apiResult.success) {
        Alert.alert(
          "Success",
          apiResult.message || "Document verified successfully!"
        );

        // --- THIS IS THE FIX ---
        // 1. Re-fetch the complete user data from the server
        const freshUserData = await fetchUser({});

        // 2. If the fetch was successful, update the global context
        if (freshUserData.success) {
          await auth.updateUser(freshUserData.data);
        }
        // --- END OF FIX ---
      } else {
        // Handle "valid but not found" cases
        Alert.alert(
          "Verification Info",
          apiResult.message || "Could not verify document."
        );
        // Refresh local state even on "failure"
        fetchUser({});
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "An unknown error occurred.");
      // Reset status on error
      if (docType === "aadhar") setAadharStatus("Not Uploaded");
      else setDlStatus("Not Uploaded");
      // Refresh local state on error
      fetchUser({});
    }
  };

  // --- Date Picker Handlers (Unchanged) ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    setDob(date.toISOString().split("T")[0]);
    hideDatePicker();
  };

  // --- Main Render ---
  if (isFetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          presentation: "modal",
          title: "Edit Profile",
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header (Unchanged) */}
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
              {isUploadingPhoto ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons
                  name="add-circle"
                  size={24}
                  color="#0D4 tribulations"
                />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name || "Your Name"}</Text>
          </View>
        </View>

        {/* Personal Details (Unchanged) */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.inputDisabled}
            placeholder="Email Address"
            value={email}
            editable={false}
          />
          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text style={dob ? styles.inputText : styles.placeholderText}>
              {dob || "Select Date of Birth"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- UPDATED VERIFICATION SECTION --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            Verification Documents (PDF only)
          </Text>
          <VerificationCard
            title="Aadhar Card"
            status={aadharStatus}
            onPick={() => handlePickDocument("aadhar")}
            isLoading={isUploadingAadhar}
          />
          <VerificationCard
            title="Driving License"
            status={dlStatus}
            onPick={() => handlePickDocument("license")}
            isLoading={isUploadingLicense}
          />
        </View>

        {updateError && <Text style={styles.errorText}>{updateError}</Text>}
        {uploadPhotoError && (
          <Text style={styles.errorText}>{uploadPhotoError}</Text>
        )}

        {/* Save Button (Unchanged) */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isUpdating && { backgroundColor: "#6497c5" },
          ]}
          onPress={handleSaveChanges}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Details</Text>
          )}
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

// --- UPDATED HELPER COMPONENT ---
// Replaced 'DocumentPicker' with 'VerificationCard' to show status
const VerificationCard = ({
  title,
  status,
  onPick,
  isLoading,
}: {
  title: string;
  status: string; // e.g., "Not Uploaded", "pending", "approved", "rejected"
  onPick: () => void;
  isLoading?: boolean;
}) => {
  const getStatusColor = () => {
    if (status === "approved") return "#2E7D32"; // Green
    if (status === "pending" || status === "Uploading...") return "#FF8F00"; // Orange
    if (status === "rejected" || status === "Not Uploaded") return "#C62828"; // Red
    return "#555";
  };

  const iconName =
    status === "approved"
      ? "shield-checkmark-outline"
      : status === "pending" || status === "Uploading..."
      ? "time-outline"
      : status === "rejected"
      ? "close-circle-outline"
      : "cloud-upload-outline";

  return (
    <TouchableOpacity
      style={styles.docPicker}
      onPress={onPick}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Ionicons name={iconName} size={30} color={getStatusColor()} />
          <Text style={styles.docPickerText}>Upload {title}</Text>
          <Text style={[styles.docStatusText, { color: getStatusColor() }]}>
            Status: {status}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// --- STYLES (with new styles added) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f6f8" },
  container: { paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  formSection: { paddingHorizontal: 20, marginBottom: 15 },
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
    justifyContent: "center",
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    height: 55,
    justifyContent: "center",
  },
  inputText: { fontSize: 16, color: "#000" },
  placeholderText: { fontSize: 16, color: "#999" },
  saveButton: {
    backgroundColor: "#0D47A1",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  errorText: {
    color: "red",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  // --- UPDATED STYLES FOR DOC PICKER ---
  docPickerText: {
    marginTop: 8,
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  docPicker: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 10,
    height: 150, // Made it taller
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fafafa",
    padding: 10,
  },
  docStatusText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
});
