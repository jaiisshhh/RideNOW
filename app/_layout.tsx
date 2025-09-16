// This is the master layout for your entire app. It's the first thing that loads and wraps everything else. Right now, its main job is to set up the status bar and declare that your app will use a tab-based navigation system.

import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      <Stack>
        {/* Add this line to hide the header on the login screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
