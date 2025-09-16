import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Keyboard } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Header from '../../../src/components/Header';
import allIndianCitiesByState from '../../../src/assets/indian-cities.json';

interface City {
  name: string;
  state: string;
}

interface DateTimeSelection {
  date: string;
  time: string;
}

const HomeScreen = () => {
  const [pickup, setPickup] = useState<DateTimeSelection>({ date: 'Select Date', time: 'Select Time' });
  const [drop, setDrop] = useState<DateTimeSelection>({ date: 'Select Date', time: 'Select Time' });
  const [isPickerVisible, setPickerVisibility] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);

  // 1. (THE FIX) Convert the object of cities into a flat array, but only once.
  const flatCityList = useMemo(() => {
    const cities: City[] = [];
    for (const state in allIndianCitiesByState) {
      allIndianCitiesByState[state as keyof typeof allIndianCitiesByState].forEach(cityName => {
        cities.push({ name: cityName, state: state });
      });
    }
    return cities;
  }, []);

  const handleSearchPress = () => {
    if (!cityQuery) {
      alert('Please select a city.');
      return;
    }
    console.log('Searching in:', { city: cityQuery, pickup, drop });
  };

  // 2. Now filter the new `flatCityList` array
  const handleCitySearch = (text: string) => {
    setCityQuery(text);
    if (text.length > 1) {
      const suggestions = flatCityList.filter(city =>
        city.name.toLowerCase().startsWith(text.toLowerCase())
      ).slice(0, 5);
      setFilteredCities(suggestions);
      setSuggestionsVisible(true);
    } else {
      setFilteredCities([]);
      setSuggestionsVisible(false);
    }
  };
  
  const onCitySelect = (city: City) => {
    setCityQuery(`${city.name}, ${city.state}`);
    setFilteredCities([]);
    setSuggestionsVisible(false);
    Keyboard.dismiss();
  };

  const showPicker = (type: string) => {
    setCurrentPicker(type);
    setPickerMode(type.includes('DATE') ? 'date' : 'time');
    setPickerVisibility(true);
  };

  const hidePicker = () => setPickerVisibility(false);

  const handleConfirm = (selectedDate: Date) => {
    const formattedDate = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (currentPicker === 'PICKUP_DATE') setPickup({ ...pickup, date: formattedDate });
    else if (currentPicker === 'PICKUP_TIME') setPickup({ ...pickup, time: formattedTime });
    else if (currentPicker === 'DROP_DATE') setDrop({ ...drop, date: formattedDate });
    else if (currentPicker === 'DROP_TIME') setDrop({ ...drop, time: formattedTime });
    hidePicker();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Find Your Perfect Ride</Text>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="location-sharp" size={20} color="#0D47A1" style={styles.searchIcon} />
              <TextInput
                placeholder='Enter city name'
                style={styles.searchInput}
                value={cityQuery}
                onChangeText={handleCitySearch}
                onFocus={() => { if (cityQuery.length > 1) setSuggestionsVisible(true) }}
              />
            </View>
            
            {isSuggestionsVisible && filteredCities.length > 0 && (
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.name + item.state}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => onCitySelect(item)}>
                    <Text>{item.name}, {item.state}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
          
          {/* --- Rest of UI is unchanged --- */}
          <View style={styles.datetimeContainer}>
            <View style={styles.datetimeColumn}>
              <Text style={styles.datetimeLabel}>Pickup</Text>
              <TouchableOpacity style={styles.datetimeButton} onPress={() => showPicker('PICKUP_DATE')}>
                <Text style={styles.datetimeText}>{pickup.date}</Text>
                <MaterialIcons name="date-range" size={18} color="#0D47A1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.datetimeButton} onPress={() => showPicker('PICKUP_TIME')}>
                <Text style={styles.datetimeText}>{pickup.time}</Text>
                <MaterialIcons name="access-time" size={18} color="#0D47A1" />
              </TouchableOpacity>
            </View>
            <View style={styles.datetimeColumn}>
              <Text style={styles.datetimeLabel}>Drop</Text>
              <TouchableOpacity style={styles.datetimeButton} onPress={() => showPicker('DROP_DATE')}>
                <Text style={styles.datetimeText}>{drop.date}</Text>
                <MaterialIcons name="date-range" size={18} color="#0D47A1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.datetimeButton} onPress={() => showPicker('DROP_TIME')}>
                <Text style={styles.datetimeText}>{drop.time}</Text>
                <MaterialIcons name="access-time" size={18} color="#0D47A1" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Text style={styles.searchButtonText}>Search Vehicles</Text>
          </TouchableOpacity>
        </View>
      </View>

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

// --- Styles are unchanged ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  container: { backgroundColor: '#fff', padding: 20, margin: 15, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, },
  suggestionsList: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datetimeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 15 },
  datetimeColumn: { flex: 1 },
  datetimeLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#555' },
  datetimeButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 10 },
  datetimeText: { fontSize: 14, color: '#555' },
  searchButton: { backgroundColor: '#0D47A1', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  searchButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default HomeScreen;