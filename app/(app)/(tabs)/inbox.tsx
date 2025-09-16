// This is your Home Screen. It's the default screen users see when they open the app. It contains the main search functionality with the date and time pickers.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Inbox() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Inbox Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18 },
});