import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getUserEmbeddedSolanaWallet, useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import LoginScreen from '@/components/LoginScreen';
import CreateQuartzAccount from '@/components/CreateQuartzAccount';
import { useAccountStatusQuery, useBalancesQuery, useBorrowLimitsQuery, useDepositLimitsQuery, useHealthQuery, usePricesQuery, useRatesQuery, useSpendLimitQuery, useWithdrawLimitsQuery } from '@/utils/queries/protocol.queries';
import { PublicKey } from '@solana/web3.js';
import { useStore } from '@/utils/store';
import { AccountStatus } from '@/types/enums/AccountStatus.enum';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useQuartzCardUserQuery } from '@/utils/queries/internalApi.queries';
import { useCardDetailsQuery, useTxHistoryQuery } from '@/utils/queries/internalApi.queries';
import { useProviderCardUserQuery } from '@/utils/queries/internalApi.queries';
import { QuartzCardAccountStatus } from '@/types/enums/QuartzCardAccountStatus.enum';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { user } = usePrivy();
  const wallet = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedSolanaWallet(user);

  const walletAddress = wallet?.wallets?.[0]?.address ? new PublicKey(wallet.wallets[0].address) : null;

  // console.log('wallet', wallet);
  // const walletAddress = new PublicKey(wallet?.wallets?.[0]?.address ?? '');
  // console.log('walletAddress', walletAddress);

  console.log('account', account);
  const {
    setIsInitialized,
    setSpendLimitRefreshing,
    jwtToken,
  } = useStore();

  // Quartz account status
  const { data: accountStatus, isLoading: isAccountStatusLoading } = useAccountStatusQuery(walletAddress);
  const isInitialized = (accountStatus === AccountStatus.INITIALIZED && !isAccountStatusLoading);
  useEffect(() => {
    setIsInitialized(isInitialized);
  }, [setIsInitialized, isInitialized]);

  // Quartz protocol account data
  usePricesQuery();
  useRatesQuery();
  useBalancesQuery(isInitialized ? walletAddress : null);
  useWithdrawLimitsQuery(isInitialized ? walletAddress : null);
  useBorrowLimitsQuery(isInitialized ? walletAddress : null);
  useDepositLimitsQuery(isInitialized ? walletAddress : null);
  useHealthQuery(isInitialized ? walletAddress : null);
  const { isStale } = useSpendLimitQuery(isInitialized ? walletAddress : null);
  useEffect(() => {
    setSpendLimitRefreshing(isStale);
  }, [isStale, setSpendLimitRefreshing]);


  const { data: quartzCardUser, status: quartzCardUserStatus } = useQuartzCardUserQuery(walletAddress);
  console.log("quartzCardUser", quartzCardUser);
  console.log("quartzCardUserStatus", quartzCardUserStatus);
  useProviderCardUserQuery(quartzCardUser?.card_api_user_id ?? null);
  useCardDetailsQuery(
    quartzCardUser?.card_api_user_id ?? null,
    isInitialized && quartzCardUser?.account_status === QuartzCardAccountStatus.CARD
  );
  useTxHistoryQuery(
    quartzCardUser?.card_api_user_id ?? null,
    isInitialized && quartzCardUser?.account_status === QuartzCardAccountStatus.CARD
  );

  // Log in card user
  useEffect(() => {
    if (
      isInitialized
      && quartzCardUser?.account_status === QuartzCardAccountStatus.CARD
      && jwtToken === undefined
    ) {
      console.log('logging in card user');
      console.log('Should ask the user if they want to accept the T&Cs', jwtToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps	
  }, [isInitialized, quartzCardUser?.account_status, jwtToken]);


  if (quartzCardUser?.account_status === QuartzCardAccountStatus.CARD) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
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
          name="card"
          options={{
            title: 'Card',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="txHistory"
          options={{
            title: 'History',
          }}
        />
      </Tabs>
    );
  }

  // Now use conditional rendering based on the state
  if (!user) {
    console.log('user in tabs layout is not logged in');
    return <LoginScreen />;
  }

  if (user && !isInitialized) {
    console.log('user in tabs layout has no Quartz account');
    return <CreateQuartzAccount />;
  }


  //TODO: Implement onboarding
  // return (
  //   <main>
  //     <div>
  //       <Onboarding />
  //     </div>
  //   </main>
  // );
}
