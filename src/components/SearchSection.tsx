import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SearchSection = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  const handleSearch = () => {
    console.log('Searching vehicles...', { pickup, dropoff });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Your Ride</Text>

      {/* Pickup Input */}
      <View style={styles.searchBar}>
        <MaterialIcons name="location-on" size={20} color="#15891D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pickup Location"
          value={pickup}
          onChangeText={setPickup}
        />
      </View>

      {/* Dropoff Input */}
      <View style={styles.searchBar}>
        <MaterialIcons name="flag" size={20} color="#15891D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Dropoff Location"
          value={dropoff}
          onChangeText={setDropoff}
        />
      </View>

      {/* Date-Time Section */}
      <View style={styles.datetimeContainer}>
        <View style={styles.datetimeColumn}>
          <Text style={styles.datetimeLabel}>Pickup Time</Text>
          <TouchableOpacity style={styles.datetimeButton}>
            <Text style={styles.datetimeText}>Select Time</Text>
            <MaterialIcons name="access-time" size={18} color="#15891D" />
          </TouchableOpacity>
        </View>

        <View style={{ width: 15 }} />

        <View style={styles.datetimeColumn}>
          <Text style={styles.datetimeLabel}>Dropoff Time</Text>
          <TouchableOpacity style={styles.datetimeButton}>
            <Text style={styles.datetimeText}>Select Time</Text>
            <MaterialIcons name="access-time" size={18} color="#15891D" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search Vehicles</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  datetimeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  datetimeColumn: { flex: 1 },
  datetimeLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#555' },
  datetimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  datetimeText: { fontSize: 14, color: '#555' },
  searchButton: { backgroundColor: '#15891D', padding: 15, borderRadius: 10, alignItems: 'center' },
  searchButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default SearchSection;
