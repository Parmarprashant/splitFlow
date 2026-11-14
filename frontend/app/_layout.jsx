import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '../src/context/ProfileContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="create-or-join" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="group-summary" />
          <Stack.Screen name="add-expense" />
          <Stack.Screen name="activity" />
          <Stack.Screen name="track-intent" />
          <Stack.Screen name="settle-up" />
        </Stack>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
