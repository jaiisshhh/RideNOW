import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../src/components/Header";

// --- 1. MODIFIED STATE ---
// Store the full Date object, not strings
interface DateTimeSelection {
  date: Date | null;
  time: Date | null;
}

// Your scalable list of cities
const CITIES = ["Vijaywada", "Lucknow"];

// Helper function to format our Date objects for the UI
const formatDate = (date: Date | null): string => {
  if (!date) return "Select Date";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (time: Date | null): string => {
  if (!time) return "Select Time";
  return time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const HomeScreen = () => {
  // --- 2. MODIFIED STATE INITIALIZATION ---
  const [pickup, setPickup] = useState<DateTimeSelection>({
    date: null,
    time: null,
  });
  const [drop, setDrop] = useState<DateTimeSelection>({
    date: null,
    time: null,
  });

  const [isPickerVisible, setPickerVisibility] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const router = useRouter();

  // --- 3. MODIFIED HANDLER ---
  const handleSearchPress = () => {
    // 1. Validation (now checks for null)
    if (!selectedCity) {
      Alert.alert("Please select a city.");
      return;
    }
    if (!pickup.date || !pickup.time || !drop.date || !drop.time) {
      Alert.alert("Please select pickup and drop-off dates and times.");
      return;
    }

    // 2. Format data for the new page
    // We already have Date objects! We just need to combine them.
    // Create a new Date from pickup.date, but set the time from pickup.time
    const pickupDateTime = new Date(pickup.date);
    pickupDateTime.setHours(pickup.time.getHours(), pickup.time.getMinutes());

    const dropDateTime = new Date(drop.date);
    dropDateTime.setHours(drop.time.getHours(), drop.time.getMinutes());

    // 3. Navigate to the new page with search parameters
    router.push({
      pathname: "/search-results",
      params: {
        city: selectedCity,
        pickup: pickupDateTime.toISOString(), // This will now work
        drop: dropDateTime.toISOString(),
      },
    });
  };

  const onCitySelect = (city: string) => {
    setSelectedCity(city);
    setDropdownVisible(false);
  };

  const showPicker = (type: string) => {
    setCurrentPicker(type);
    setPickerMode(type.includes("DATE") ? "date" : "time");
    setPickerVisibility(true);
  };

  const hidePicker = () => setPickerVisibility(false);

  // --- 4. MODIFIED CONFIRM HANDLER ---
  const handleConfirm = (selectedDate: Date) => {
    // 'selectedDate' is the full Date object from the picker
    if (currentPicker === "PICKUP_DATE")
      setPickup({ ...pickup, date: selectedDate });
    else if (currentPicker === "PICKUP_TIME")
      setPickup({ ...pickup, time: selectedDate });
    else if (currentPicker === "DROP_DATE")
      setDrop({ ...drop, date: selectedDate });
    else if (currentPicker === "DROP_TIME")
      setDrop({ ...drop, time: selectedDate });

    hidePicker();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <Text style={styles.heroTitle}>
            Unlock your city,{"\n"}one ride at a time
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.searchCard}
        >
          {/* City Dropdown */}
          <View>
            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => {
                setDropdownVisible(!isDropdownVisible);
                Keyboard.dismiss();
              }}
            >
              <Feather
                name="map-pin"
                size={20}
                color="#0D47A1"
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.searchInput,
                  { color: selectedCity ? "#111" : "#555" },
                ]}
              >
                {selectedCity || "Select a city"}
              </Text>
              <Feather
                name={isDropdownVisible ? "chevron-up" : "chevron-down"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>

            {isDropdownVisible && (
              <View style={styles.dropdownList}>
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.suggestionItem}
                    onPress={() => onCitySelect(city)}
                  >
                    <Text>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* --- 5. MODIFIED JSX --- */}
          {/* Pickup Row */}
          <View style={styles.inputRow}>
            <Feather
              name="clock"
              size={20}
              color="#333"
              style={styles.inputIcon}
            />
            <Text style={styles.rowLabel}>Pickup</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => showPicker("PICKUP_DATE")}
            >
              {/* Use the formatter function */}
              <Text style={styles.dateTimeText}>{formatDate(pickup.date)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeButton, styles.timeButton]}
              onPress={() => showPicker("PICKUP_TIME")}
            >
              {/* Use the formatter function */}
              <Text style={styles.dateTimeText}>{formatTime(pickup.time)}</Text>
            </TouchableOpacity>
          </View>

          {/* Drop Row */}
          <View style={styles.inputRow}>
            <Feather
              name="clock"
              size={20}
              color="#333"
              style={styles.inputIcon}
            />
            <Text style={styles.rowLabel}>Drop-off</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => showPicker("DROP_DATE")}
            >
              {/* Use the formatter function */}
              <Text style={styles.dateTimeText}>{formatDate(drop.date)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeButton, styles.timeButton]}
              onPress={() => showPicker("DROP_TIME")}
            >
              {/* Use the formatter function */}
              <Text style={styles.dateTimeText}>{formatTime(drop.time)}</Text>
            </TouchableOpacity>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
          >
            <Text style={styles.searchButtonText}>Find Scooters</Text>
            <MaterialIcons name="two-wheeler" size={20} color="white" />
          </TouchableOpacity>
        </MotiView>

        {/* Why RideNow? Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
        >
          <Text style={styles.sectionTitle}>Why RideNow?</Text>
          <BenefitCard
            icon="cash-outline"
            title="Save Up to 40%"
            description="More affordable than taxis. Rent a scooty for the price of a coffee."
          />
          <BenefitCard
            icon="flash-outline"
            title="Ready When You Are"
            description="Book in 30 seconds, unlock and go. No waiting, no surge pricing."
          />
          <BenefitCard
            icon="map-outline"
            title="Explore Freely"
            description="Discover the city's hidden gems on your own terms. Your ride, your rules."
          />
        </MotiView>
      </ScrollView>

      {/* Date/Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={pickerMode}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        minimumDate={new Date()}
      />
    </SafeAreaView>
  );
};

// Benefit Card Component (Unchanged)
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

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 25,
    lineHeight: 40,
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 30,
    zIndex: 100,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  rowLabel: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
    flex: 1,
  },
  dateTimeButton: {
    backgroundColor: "#e9eef2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeButton: {
    marginLeft: 8,
  },
  dateTimeText: {
    color: "#0D47A1",
    fontWeight: "600",
    fontSize: 14,
  },
  dropdownList: {
    marginTop: -10,
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchButton: {
    backgroundColor: "#0D47A1",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  searchButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  benefitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitIconContainer: {
    backgroundColor: "#e9eef2",
    borderRadius: 25,
    width: 50,
    height: 50,
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

export default HomeScreen;
