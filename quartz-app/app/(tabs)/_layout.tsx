import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import LoginScreen from '@/components/LoginScreen';
import CreateQuartzAccount from '@/components/CreateQuartzAccount';
import { useAccountStatusQuery } from '@/utils/queries/protocol.queries';
import { PublicKey } from '@solana/web3.js';
import { useStore } from '@/utils/store';
import { AccountStatus } from '@/types/enums/AccountStatus.enum';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = usePrivy();
  const wallet = useEmbeddedSolanaWallet();

  // Move the hook outside of the conditional
  const walletAddress = wallet?.wallets?.[0]?.address;
  console.log('walletAddress', walletAddress);
  const { data: accountStatus, isLoading: isAccountStatusLoading } = useAccountStatusQuery(
    walletAddress ? new PublicKey(walletAddress) : null
  );

  const { 
    setIsInitialized,
    isInitialized
  } = useStore();

  // Quartz account status
  const isQuartzInitialized = (accountStatus === AccountStatus.INITIALIZED && !isAccountStatusLoading);
  useEffect(() => {
    setIsInitialized(isQuartzInitialized);
  }, [setIsInitialized, isQuartzInitialized]);

  console.log('accountStatus', accountStatus);

  // Now use conditional rendering based on the state
  if (!user) {
    console.log('user in tabs layout is not logged in');
    return <LoginScreen />;
  }

  if (user && !isInitialized) {
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
    </Tabs>
  );
}
