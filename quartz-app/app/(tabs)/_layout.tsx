import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrivy } from '@privy-io/expo';
import LoginScreen from '@/components/LoginScreen';
import { useAppState } from '@/context/AppStateContext';
import CreateQuartzAccount from '@/components/CreateQuartzAccount';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { user } = usePrivy();

  const { state } = useAppState();

  if (!user) {
    console.log('user in tabs layout is not logged in');
    return <LoginScreen />;
  }

  if (!state.user.hasQuartzAccount) {
    console.log('user in tabs layout has no Quartz account');
    return <CreateQuartzAccount />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Card',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
