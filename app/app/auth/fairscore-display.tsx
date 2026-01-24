import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const TIER_CONFIG: Record<string, { color: string; gradient: [string, string]; icon: string }> = {
  BRONZE: { color: "#CD7F32", gradient: ["#CD7F32", "#8B4513"], icon: "🥉" },
  SILVER: { color: "#C0C0C0", gradient: ["#C0C0C0", "#808080"], icon: "🥈" },
  GOLD: { color: "#FFD700", gradient: ["#FFD700", "#FFA500"], icon: "🥇" },
  DIAMOND: { color: "#B9F2FF", gradient: ["#B9F2FF", "#00CED1"], icon: "💎" },
  UNVERIFIED: { color: "#6B7280", gradient: ["#6B7280", "#4B5563"], icon: "⏳" },
};

export default function FairScoreDisplayScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Score counting animation
    if (user?.fairScore) {
      Animated.timing(scoreAnim, {
        toValue: user.fairScore,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      scoreAnim.addListener(({ value }) => {
        setDisplayScore(Math.floor(value));
      });
    }

    // Pulse animation for tier badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => scoreAnim.removeAllListeners();
  }, [user?.fairScore]);

  if (!user) return null;

  const tierKey = user.fairTier || "UNVERIFIED";
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.UNVERIFIED;
  const capabilities = user.capabilities;

  return (
    <LinearGradient
      colors={["#07152B", "#0f1f3d", "#07152B"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Decorative glows */}
        <View className="absolute top-32 -right-20 w-64 h-64 rounded-full blur-3xl" 
          style={{ backgroundColor: `${tierConfig.color}20` }} 
        />
        <View className="absolute bottom-40 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Header */}
            <View className="items-center pt-10 mb-8">
              <View className="w-20 h-20 bg-green-500/20 border-2 border-green-500/40 rounded-3xl items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              </View>
              {/* <Text className="text-white text-xl font-bold mb-1">Welcome to Vouchd!</Text> */}
              <Text className="text-white/70 text-md">Your trust profile is ready</Text>
            </View>

            {/* Hero Score Card */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                className="rounded-3xl border border-white/10 p-6 mb-6 overflow-hidden"
              >
                {/* Tier glow effect */}
                <View 
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
                  style={{ backgroundColor: `${tierConfig.color}30` }}
                />
                
                {/* Score Section */}
                <View className="items-center mb-6">
                  <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-2">
                    Your FairScore
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-7xl font-black text-white">{displayScore}</Text>
                    <Text className="text-2xl text-white/30 ml-1">/1000</Text>
                  </View>
                </View>

                {/* Tier Badge */}
                <View className="items-center">
                  <LinearGradient
                    colors={tierConfig.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-6 py-3 rounded-full flex-row items-center"
                    style={{ shadowColor: tierConfig.color, shadowRadius: 20, shadowOpacity: 0.5 }}
                  >
                    <Text className="text-2xl mr-2">{tierConfig.icon}</Text>
                    <Text className="text-white font-bold text-lg tracking-wide">{tierKey} TIER</Text>
                  </LinearGradient>
                </View>

                {/* Score Pillars */}
                <View className="flex-row mt-6 gap-3">
                  <View className="flex-1 bg-white/5 rounded-xl p-4 items-center border border-white/10">
                    <Text className="text-blue-400 text-2xl font-bold">{user.walletScore || 0}</Text>
                    <Text className="text-white/40 text-xs mt-1">Wallet Score</Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-xl p-4 items-center border border-white/10">
                    <Text className="text-purple-400 text-2xl font-bold">{user.socialScore || 0}</Text>
                    <Text className="text-white/40 text-xs mt-1">Social Score</Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-xl p-4 items-center border border-white/10">
                    <Text className="text-green-400 text-2xl font-bold">{user.starRating || 0}★</Text>
                    <Text className="text-white/40 text-xs mt-1">Rating</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Your Benefits */}
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-yellow-500/20 rounded-xl items-center justify-center mr-3">
                  <Text className="text-xl">🎁</Text>
                </View>
                <Text className="text-white font-bold text-lg">Your Benefits</Text>
              </View>

              <View className="gap-3">
                <BenefitItem 
                  icon="💰" 
                  label="Max Trade" 
                  value={`$${(capabilities?.maxTradeAmount || 0).toLocaleString()}`}
                  color="#22c55e"
                />
                <BenefitItem 
                  icon="📊" 
                  label="Daily Limit" 
                  value={`$${(capabilities?.dailyLimit || 0).toLocaleString()}`}
                  color="#3b82f6"
                />
                <BenefitItem 
                  icon="⚡" 
                  label="Trading Fee" 
                  value={`${((capabilities?.feePercentage || 0) * 100).toFixed(1)}%`}
                  color="#a855f7"
                />
                <BenefitItem 
                  icon={capabilities?.canSell ? "✅" : "🔒"} 
                  label="Selling" 
                  value={capabilities?.canSell ? "Enabled" : "Locked"}
                  color={capabilities?.canSell ? "#22c55e" : "#ef4444"}
                />
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-3 mb-8">
              <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <Text className="text-2xl mb-1">📈</Text>
                <Text className="text-white font-bold">{user.totalTrades || 0}</Text>
                <Text className="text-white/30 text-xs">Trades</Text>
              </View>
              <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <Text className="text-2xl mb-1">{user.kycVerified ? "✓" : "○"}</Text>
                <Text className="text-white font-bold">{user.kycVerified ? "Verified" : "Basic"}</Text>
                <Text className="text-white/30 text-xs">Status</Text>
              </View>
              <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center">
                <Text className="text-2xl mb-1">🏆</Text>
                <Text className="text-white font-bold">{user.fairBadges?.length || 0}</Text>
                <Text className="text-white/30 text-xs">Badges</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              className="w-full mb-3"
              onPress={() => router.replace("/(tabs)" as any)}
            >
              <LinearGradient
                colors={["#6366f1", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-5 items-center flex-row justify-center"
                style={{ shadowColor: '#6366f1', shadowRadius: 20, shadowOpacity: 0.5 }}
              >
                <Text className="text-white font-bold text-lg mr-2">Explore Marketplace</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 items-center"
              onPress={() => router.push("/profile")}
            >
              <Text className="text-white/70 font-semibold">View Full Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BenefitItem({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-white/5">
      <View className="flex-row items-center">
        <Text className="text-xl mr-3">{icon}</Text>
        <Text className="text-white/60">{label}</Text>
      </View>
      <Text className="font-bold" style={{ color }}>{value}</Text>
    </View>
  );
}
