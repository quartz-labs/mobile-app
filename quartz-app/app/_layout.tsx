import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PrivyElements, PrivyProvider } from '@privy-io/expo';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import Constants from 'expo-constants';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppStateProvider } from '@/context/AppStateContext';
import { ReactQueryProvider } from '@/context/react-query-provider';
import { ErrorProvider } from '@/context/error-provider';
import { TxStatusProvider } from '@/context/tx-status-provider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  console.log("Root Layout!!");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Get Privy configuration from Constants
  const privyAppId = Constants.expoConfig?.extra?.privyAppId || '';
  console.log('privyAppId', privyAppId);
  const privyClientId = Constants.expoConfig?.extra?.privyClientId || '';

  return (
    <ErrorProvider>
      <ReactQueryProvider>
        <AppStateProvider>
          <TxStatusProvider>
            <PrivyProvider
              appId={privyAppId}
              clientId={privyClientId}
              config={{
                embedded: {
                  solana: {
                    createOnLogin: 'users-without-wallets', // defaults to 'off'
                  },
                },
              }}
            >
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <PrivyElements config={{ appearance: { colorScheme: colorScheme! } }} />
                <StatusBar style="auto" />
              </ThemeProvider>
            </PrivyProvider>
          </TxStatusProvider>
        </AppStateProvider>
      </ReactQueryProvider>
    </ErrorProvider>
  );
}
