import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth";

const { width } = Dimensions.get("window");

export default function Index() {
  const { isAuthenticated, isLoading, hasOnboarded } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#07152B' }}>
        <Text className="text-5xl font-bold text-white mb-4">Vouchd</Text>
        <View className="w-16 h-1 bg-white/30 rounded-full mb-8" />
        <View className="flex-row space-x-2">
          <View className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <View className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <View className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  if (!hasOnboarded) {
    return <Redirect href="/welcome" />;
  }

  return (
    <LinearGradient
      colors={["#07152B", "#0f1f3d", "#07152B"]}
      className="flex-1"
    >
      {/* Decorative Elements */}
      <View className="absolute top-20 right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      <View className="absolute top-60 left-4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
      <View className="absolute bottom-40 right-4 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Logo Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center mb-6 shadow-xl" style={{ shadowColor: '#6366f1', shadowRadius: 30, shadowOpacity: 0.5 }}>
            <Text className="text-4xl">🤝</Text>
          </View>
          <Text className="text-5xl font-black text-white mb-2 tracking-tight">Vouchd</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <Text className="text-white/50 text-sm font-medium">Trust-Based P2P Exchange</Text>
          </View>
        </View>

        {/* Feature Cards - Glassmorphism */}
        <View className="w-full space-y-3 mb-10">
          <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex-row items-center">
            <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
              <Text className="text-2xl">🛡️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">FairScale Reputation</Text>
              <Text className="text-white/40 text-sm">Trust scores powered by on-chain data</Text>
            </View>
          </View>

          <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex-row items-center">
            <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
              <Text className="text-2xl">⚡</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Smart Contract Escrow</Text>
              <Text className="text-white/40 text-sm">Non-custodial & trustless trades</Text>
            </View>
          </View>

          <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex-row items-center">
            <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
              <Text className="text-2xl">💎</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Tier-Based Rewards</Text>
              <Text className="text-white/40 text-sm">Earn more as your reputation grows</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <Link href="/auth/connect-wallet" asChild>
          <TouchableOpacity className="w-full mb-4">
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-5 items-center shadow-xl"
              style={{ shadowColor: '#6366f1', shadowRadius: 20, shadowOpacity: 0.5 }}
            >
              <Text className="text-white font-bold text-lg">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>

        {/* Secondary Link */}
        <Link href="/welcome" asChild>
          <TouchableOpacity className="py-3">
            <Text className="text-white/40 text-sm">Learn more about Vouchd →</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Footer */}
      <View className="pb-10 items-center">
        <Text className="text-white/20 text-xs">Powered by Solana & FairScale</Text>
      </View>
    </LinearGradient>
  );
}
