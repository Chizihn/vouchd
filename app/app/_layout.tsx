import "../utils/polyfills";
import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack, SplashScreen } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";
import { useAuthStore } from "@/store/auth";
import { SolanaWalletProvider } from "@/providers/SolanaWalletProvider";
import { View, ActivityIndicator, Dimensions } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { 
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold 
} from "@expo-google-fonts/outfit";

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

// App theme colors
const THEME = {
  background: "#07152B",
  primary: "#6366F1",
};

// Branded loading screen component
const LoadingScreen = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: THEME.background }}>
    <AppText weight="bold" style={{ fontSize: 48, color: "#FFFFFF", marginBottom: 16 }}>Vouchd</AppText>
    <View style={{ width: 64, height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, marginBottom: 32 }} />
    <ActivityIndicator size="large" color="#FFFFFF" />
    <AppText style={{ color: "rgba(255,255,255,0.6)", marginTop: 16 }}>Loading...</AppText>
  </View>
);

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadStoredAuth();
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        if (fontsLoaded) {
          setAppReady(true);
          SplashScreen.hideAsync();
        }
      }
    };

    if (fontsLoaded) {
      initialize();
    }
  }, [fontsLoaded]);

  if (!appReady || isLoading || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: THEME.background }}>
      <ApolloProvider client={apolloClient}>
        <SolanaWalletProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: THEME.background,
              },
            }}
          />
        </SolanaWalletProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
