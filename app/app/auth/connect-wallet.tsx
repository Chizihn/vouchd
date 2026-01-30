import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION } from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConnectWalletScreen() {
  const router = useRouter();
  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const authStore = useAuthStore();
  const { connectWallet, connecting } = useSolanaWallet();
  
  const isBusy = useMemo(
    () => connecting || loginLoading,
    [connecting, loginLoading],
  );

  const handleConnectWallet = async () => {
    try {
      // Step 1: Connect wallet via MWA
      console.log("Starting wallet connection...");
      const walletResult = await connectWallet();

      if (!walletResult?.address) {
        throw new Error("Connection failed or was cancelled.");
      }

      console.log("Wallet connected:", walletResult.address);

      // Step 2: Login with wallet address (no signature needed - just like gocabs)
      console.log("Logging in via backend...");
      const { data, errors } = await login({
        variables: {
          walletAddress: walletResult.address,
        },
        errorPolicy: "all",
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (data?.login) {
        console.log("Login successful!", data.login);
        await authStore.login(data.login.user, data.login.token);
        router.replace("/auth/fairscore-display");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      Alert.alert(
        "Connection Failed",
        error.message || "Could not connect wallet",
      );
    }
  };

  return (
    <LinearGradient
      colors={["#07152B", "#0f1f3d", "#07152B"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Decorative */}
        <View className="absolute top-40 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <View className="absolute bottom-60 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Back Button */}
        <TouchableOpacity
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-full items-center justify-center m-5"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center mb-8 shadow-xl" style={{ shadowColor: '#6366f1', shadowRadius: 30, shadowOpacity: 0.5 }}>
              <AppText className="text-5xl">🔗</AppText>
            </View>
            <AppText weight="bold" className="text-3xl text-white text-center mb-3">
              Connect Your Wallet
            </AppText>
            <AppText className="text-white/50 text-center text-base px-4">
              Link your Solana wallet to start trading with verified peers
            </AppText>
          </View>

          {/* Supported Wallets Display */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
            <AppText variant="label" className="text-white/40 mb-4 text-center">Supported Wallets</AppText>
            <View className="flex-row justify-center items-center gap-6">
              <View className="items-center">
                <View className="w-14 h-14 bg-purple-500/20 rounded-xl items-center justify-center mb-2">
                  <AppText className="text-2xl">👻</AppText>
                </View>
                <AppText variant="caption" className="text-white/60">Phantom</AppText>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 bg-orange-500/20 rounded-xl items-center justify-center mb-2">
                  <AppText className="text-2xl">🔥</AppText>
                </View>
                <AppText variant="caption" className="text-white/60">Solflare</AppText>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 bg-red-500/20 rounded-xl items-center justify-center mb-2">
                  <AppText className="text-2xl">🎒</AppText>
                </View>
                <AppText variant="caption" className="text-white/60">Backpack</AppText>
              </View>
            </View>
          </View>

          {/* Connect Button */}
          <TouchableOpacity
            className="w-full mb-6"
            onPress={handleConnectWallet}
            disabled={isBusy}
          >
            <LinearGradient
              colors={isBusy ? ["#4b5563", "#374151"] : ["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-5 items-center flex-row justify-center"
              style={{ shadowColor: '#6366f1', shadowRadius: 20, shadowOpacity: 0.5 }}
            >
              {isBusy ? (
                <>
                  <ActivityIndicator color="#FFFFFF" style={{ marginRight: 10 }} />
                  <AppText weight="bold" className="text-white text-lg">Connecting...</AppText>
                </>
              ) : (
                <AppText weight="bold" className="text-white text-lg">Connect Wallet</AppText>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Card */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <AppText className="text-lg mr-2">🔒</AppText>
              <AppText weight="semibold" className="text-white">Your Wallet, Your Keys</AppText>
            </View>
            <AppText className="text-white/40 text-sm leading-5">
              We'll fetch your FairScore based on your on-chain history. No transactions without your explicit approval.
            </AppText>
          </View>

          {/* Footer */}
          <View className="items-center pb-6">
            <View className="flex-row justify-center items-center mb-3">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <AppText variant="caption" className="text-white/30 text-center">Secure connection via Solana MWA</AppText>
            </View>
            <TouchableOpacity>
              <AppText variant="caption" className="text-white/30 text-center underline">
                New to Solana? Learn about wallets
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
