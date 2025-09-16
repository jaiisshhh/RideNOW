import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Host() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Host Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18 },
});