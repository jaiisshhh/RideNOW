// This is the Header component that appears at the top of your home screen. It currently just displays the RideNOW logo.

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Removed the props as the icons are no longer here
const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    // Changed to center the logo
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logo: {
    // Increased the size of the logo
    width: 150,
    height: 45,
  },
});

export default Header;