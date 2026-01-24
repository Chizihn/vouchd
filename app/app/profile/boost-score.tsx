import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

const TIER_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  DIAMOND: "#B9F2FF",
  UNVERIFIED: "#6B7280",
};

export default function BoostScoreScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);

  if (!user) return null;

  const tierColor = TIER_COLORS[user.fairTier] || TIER_COLORS.UNVERIFIED;

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Boost Your Score</Text>
            <Text className="text-white/40 text-xs">Improve reputation, unlock higher limits</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Current Score */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-5 items-center">
            <Text className="text-white/40 text-xs uppercase tracking-wider mb-2">Current FairScore</Text>
            <Text className="text-5xl font-bold" style={{ color: tierColor }}>
              {user.fairScore || 0}
            </Text>
            <View 
              className="px-4 py-1.5 rounded-full mt-3"
              style={{ backgroundColor: `${tierColor}20` }}
            >
              <Text style={{ color: tierColor }} className="font-bold text-sm">
                {user.fairTier || "UNVERIFIED"} TIER
              </Text>
            </View>
          </View>

          {/* Score Breakdown */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 items-center">
              <Text className="text-blue-400 text-2xl font-bold">{user.walletScore || 0}</Text>
              <Text className="text-white/40 text-xs">Wallet Score</Text>
            </View>
            <View className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 items-center">
              <Text className="text-purple-400 text-2xl font-bold">{user.socialScore || 0}</Text>
              <Text className="text-white/40 text-xs">Social Score</Text>
            </View>
          </View>

          {/* Quests Section */}
          <Text className="text-white font-bold text-lg mt-6 mb-4">Quests to Boost Score</Text>

          <QuestItem
            icon="🏦"
            title="Verify Bank Account"
            description="Confirm ownership of your settlement account"
            points="+50 points"
            completed={user.kycVerified}
          />
          <QuestItem
            icon="📱"
            title="Link Social Accounts"
            description="Connect X or Discord to verify identity"
            points="+30 points"
            completed={!!user.socialScore && user.socialScore > 20}
            onPress={() => router.push("/profile/kyc-hub" as any)}
          />
          <QuestItem
            icon="🤝"
            title="Complete 5 Trades"
            description="Maintain 100% completion rate"
            points="+100 points"
            completed={user.completedTrades >= 5}
          />
          <QuestItem
            icon="💎"
            title="Hold Crypto 30+ Days"
            description="Diamond hands get rewarded"
            points="+75 points"
            completed={false}
          />
          <QuestItem
            icon="🖼️"
            title="Acquire FairCard NFT"
            description="Purchase or earn a dynamic reputation NFT"
            points="+150 points"
            completed={false}
          />

          {/* Flash Trust CTA */}
          <TouchableOpacity 
            onPress={() => router.push("/profile/flash-trust" as any)}
            className="mt-6"
          >
            <LinearGradient
              colors={["#8b5cf6", "#6366f1"]}
              className="rounded-2xl p-5"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-bold text-lg">Flash Trust ⚡</Text>
                  <Text className="text-white/70 text-sm">Instant tier boost with collateral</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Pro Tip */}
          <View className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 mt-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Text className="text-xl mr-2">💡</Text>
              <Text className="text-indigo-400 font-bold">Pro Tip</Text>
            </View>
            <Text className="text-indigo-300/70 text-sm leading-5">
              High-volume traders with consistent performance get prioritized in our matching algorithm and earn reputation dividends.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuestItem({ 
  icon, 
  title, 
  description, 
  points, 
  completed,
  onPress 
}: { 
  icon: string;
  title: string;
  description: string;
  points: string;
  completed: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity 
      className={`rounded-2xl p-4 mb-3 flex-row items-center ${
        completed 
          ? "bg-green-500/10 border border-green-500/20" 
          : "bg-white/5 border border-white/10"
      }`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
        completed ? "bg-green-500/20" : "bg-white/10"
      }`}>
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className={completed ? "text-green-400 font-bold" : "text-white font-bold"}>
          {title}
        </Text>
        <Text className="text-white/40 text-xs">{description}</Text>
      </View>
      <View className="items-end">
        {completed ? (
          <View className="bg-green-500/20 px-3 py-1 rounded-full">
            <Text className="text-green-400 font-bold text-sm">✓ Done</Text>
          </View>
        ) : (
          <Text className="text-indigo-400 font-bold text-sm">{points}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
