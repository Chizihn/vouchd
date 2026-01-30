import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

const TIERS = [
  { 
    name: "BRONZE", 
    color: "#CD7F32", 
    icon: "🥉",
    collateral: 50,
    maxTrade: 500,
    fee: "2.0%",
  },
  { 
    name: "SILVER", 
    color: "#C0C0C0", 
    icon: "🥈",
    collateral: 150,
    maxTrade: 2000,
    fee: "1.5%",
  },
  { 
    name: "GOLD", 
    color: "#FFD700", 
    icon: "🥇",
    collateral: 500,
    maxTrade: 10000,
    fee: "1.0%",
  },
  { 
    name: "DIAMOND", 
    color: "#B9F2FF", 
    icon: "💎",
    collateral: 2000,
    maxTrade: 50000,
    fee: "0.5%",
  },
];

export default function FlashTrustScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedTier, setSelectedTier] = useState<typeof TIERS[0] | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const currentTierIndex = TIERS.findIndex(t => t.name === user?.fairTier) || 0;

  const handleActivate = async () => {
    if (!selectedTier) return;

    Alert.alert(
      "Activate Flash Trust",
      `Deposit ${selectedTier.collateral} USDC as collateral to temporarily boost to ${selectedTier.name} tier for 24 hours?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          onPress: async () => {
            setIsActivating(true);
            // Simulate activation
            setTimeout(() => {
              setIsActivating(false);
              Alert.alert(
                "Flash Trust Activated! ⚡",
                `You're now temporarily a ${selectedTier.name} trader for the next 24 hours. Your collateral will be returned after the period ends.`,
                [{ text: "OK", onPress: () => router.back() }]
              );
            }, 2000);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <AppText variant="h3" weight="bold" className="text-white">Flash Trust ⚡</AppText>
            <AppText variant="caption" className="text-white/40">Temporary tier boost with collateral</AppText>
          </View>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Explanation Card */}
          <View className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-5 mt-5">
            <View className="flex-row items-center mb-3">
              <AppText className="text-3xl mr-3">⚡</AppText>
              <View>
                <AppText weight="bold" className="text-white text-lg">What is Flash Trust?</AppText>
                <AppText variant="caption" className="text-white/50">Instant tier upgrade</AppText>
              </View>
            </View>
            <AppText className="text-white/70 text-sm leading-5">
              Flash Trust lets you temporarily boost your trading tier by depositing USDC as collateral. 
              Perfect for one-time high-value trades when your score is still building.
            </AppText>
            <View className="mt-4 bg-white/5 rounded-xl p-3">
              <AppText weight="bold" className="text-yellow-400 text-xs">
                ⏱️ Duration: 24 hours • Collateral returned after expiry
              </AppText>
            </View>
          </View>

          {/* Current Status */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-5">
            <AppText variant="label" className="text-white/40 mb-3">
              Your Current Status
            </AppText>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <AppText className="text-3xl mr-3">
                  {TIERS[currentTierIndex]?.icon || "⏳"}
                </AppText>
                <View>
                  <AppText weight="bold" className="text-white">{user?.fairTier || "UNVERIFIED"}</AppText>
                  <AppText variant="caption" className="text-white/40">FairScore: {user?.fairScore || 0}</AppText>
                </View>
              </View>
              <View className="bg-white/10 px-3 py-1.5 rounded-full">
                <AppText className="text-white/60 text-xs">Current</AppText>
              </View>
            </View>
          </View>

          {/* Select Tier */}
          <AppText weight="bold" className="text-white text-lg mt-6 mb-3">Select Upgrade Tier</AppText>
          
          {TIERS.map((tier, index) => {
            const isCurrentOrLower = index <= currentTierIndex;
            const isSelected = selectedTier?.name === tier.name;
            
            return (
              <TouchableOpacity
                key={tier.name}
                disabled={isCurrentOrLower}
                onPress={() => setSelectedTier(tier)}
                className={`mb-3 rounded-2xl p-5 border ${
                  isSelected 
                    ? "border-indigo-500 bg-indigo-500/20" 
                    : isCurrentOrLower 
                      ? "border-white/5 bg-white/5 opacity-40" 
                      : "border-white/10 bg-white/5"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${tier.color}20` }}
                    >
                      <AppText className="text-2xl">{tier.icon}</AppText>
                    </View>
                    <View>
                      <AppText weight="bold" className="text-white">{tier.name}</AppText>
                      <AppText variant="caption" className="text-white/40">
                        Max Trade: ${tier.maxTrade.toLocaleString()} • Fee: {tier.fee}
                      </AppText>
                    </View>
                  </View>
                  <View className="items-end">
                    {isCurrentOrLower ? (
                      <AppText className="text-white/30 text-xs">Your tier or lower</AppText>
                    ) : (
                      <>
                        <AppText weight="bold" className="text-white">{tier.collateral} USDC</AppText>
                        <AppText variant="caption" className="text-white/40">Collateral</AppText>
                      </>
                    )}
                  </View>
                </View>
                {isSelected && (
                  <View className="mt-3 pt-3 border-t border-indigo-500/30">
                    <AppText weight="medium" className="text-indigo-400 text-center text-sm">
                      ✓ Selected for Flash Trust
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Activate Button */}
          <TouchableOpacity
            onPress={handleActivate}
            disabled={!selectedTier || isActivating}
            className="mt-4 mb-8"
            style={{ opacity: selectedTier && !isActivating ? 1 : 0.5 }}
          >
            <LinearGradient
              colors={["#8b5cf6", "#6366f1"]}
              className="rounded-2xl py-4 items-center"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isActivating ? (
                <AppText weight="bold" className="text-white text-lg">Activating...</AppText>
              ) : selectedTier ? (
                <AppText weight="bold" className="text-white text-lg">
                  Deposit {selectedTier.collateral} USDC & Activate ⚡
                </AppText>
              ) : (
                <AppText weight="bold" className="text-white text-lg">
                  Select a Tier to Upgrade
                </AppText>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Warning */}
          <View className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={18} color="#eab308" />
              <AppText weight="bold" className="text-yellow-500 ml-2">Important</AppText>
            </View>
            <AppText variant="caption" className="text-yellow-500/70">
              If you fail to complete trades properly during Flash Trust, your collateral may be partially slashed as penalty.
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
