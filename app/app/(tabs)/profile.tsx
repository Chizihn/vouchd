import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SkeletonProfileHeader } from "@/components/ui/Skeleton";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

const TIER_CONFIG: Record<string, { color: string; icon: string }> = {
  BRONZE: { color: "#CD7F32", icon: "🥉" },
  SILVER: { color: "#C0C0C0", icon: "🥈" },
  GOLD: { color: "#FFD700", icon: "🥇" },
  DIAMOND: { color: "#B9F2FF", icon: "💎" },
  UNVERIFIED: { color: "#6B7280", icon: "⏳" },
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleLogout = () => {
    Alert.alert(
      "Disconnect Wallet",
      "Are you sure you want to disconnect?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Disconnect", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/welcome");
          }
        },
      ]
    );
  };

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.background }}>
        <SafeAreaView style={{ flex: 1 }}>
          <SkeletonProfileHeader />
        </SafeAreaView>
      </View>
    );
  }

  const tierKey = user.fairTier || "UNVERIFIED";
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.UNVERIFIED;
  const capabilities = user.capabilities;

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Header */}
          <View className="items-center px-5 pt-6 pb-8">
            {/* Avatar */}
            <View 
              className="w-24 h-24 rounded-full items-center justify-center mb-4 border-4"
              style={{ 
                backgroundColor: `${tierConfig.color}20`,
                borderColor: `${tierConfig.color}40`,
              }}
            >
              <Text className="text-4xl">{tierConfig.icon}</Text>
            </View>

            {/* Name & Tier */}
            <Text className="text-white text-xl font-bold mb-1">
              {user.username || "Anonymous Trader"}
            </Text>
            <View 
              className="px-4 py-1.5 rounded-full flex-row items-center"
              style={{ backgroundColor: `${tierConfig.color}20` }}
            >
              <Text style={{ color: tierConfig.color }} className="font-bold text-sm">
                {tierKey} • {user.fairScore || 0}
              </Text>
            </View>

            {/* Wallet Address */}
            <View className="mt-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full flex-row items-center">
              <Text className="text-white/40 font-mono text-xs">
                {formatWallet(user.walletAddress)}
              </Text>
              <TouchableOpacity className="ml-2">
                <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row px-5 gap-3 mb-6">
            <StatCard 
              icon="📊" 
              value={user.totalTrades?.toString() || "0"} 
              label="Trades" 
            />
            <StatCard 
              icon="⭐" 
              value={user.averageRating?.toFixed(1) || "—"} 
              label="Rating" 
            />
            <StatCard 
              icon="✅" 
              value={`${user.completedTrades || 0}`} 
              label="Completed" 
            />
          </View>

          {/* Score Breakdown */}
          <View className="px-5 mb-6">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <Text className="text-white font-bold text-lg mb-4">Score Breakdown</Text>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1 bg-blue-500/10 rounded-xl p-3 items-center">
                  <Text className="text-blue-400 text-2xl font-bold">{user.walletScore || 0}</Text>
                  <Text className="text-white/40 text-xs">Wallet</Text>
                </View>
                <View className="flex-1 bg-purple-500/10 rounded-xl p-3 items-center">
                  <Text className="text-purple-400 text-2xl font-bold">{user.socialScore || 0}</Text>
                  <Text className="text-white/40 text-xs">Social</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl py-3 items-center"
                onPress={() => router.push("/profile/boost-score")}
              >
                <Text className="text-indigo-400 font-bold">Boost Score →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tier Benefits */}
          <View className="px-5 mb-6">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <Text className="text-white font-bold text-lg mb-4">Your Benefits</Text>
              <BenefitRow 
                label="Max Trade" 
                value={`$${(capabilities?.maxTradeAmount || 0).toLocaleString()}`}
              />
              <BenefitRow 
                label="Daily Limit" 
                value={`$${(capabilities?.dailyLimit || 0).toLocaleString()}`}
              />
              <BenefitRow 
                label="Trading Fee" 
                value={`${((capabilities?.feePercentage || 0) * 100).toFixed(1)}%`}
              />
              <BenefitRow 
                label="Can Sell" 
                value={capabilities?.canSell ? "Yes ✓" : "No ✗"}
                highlight={capabilities?.canSell}
              />
            </View>
          </View>

          {/* Menu Items */}
          <View className="px-5 mb-6">
            <MenuItem 
              icon="flash-outline" 
              label="Flash Trust ⚡" 
              subtitle="Boost tier with collateral"
              onPress={() => router.push("/profile/flash-trust" as any)} 
              highlight
            />
            <MenuItem 
              icon="shield-checkmark-outline" 
              label="KYC Hub 🔐" 
              subtitle="Link socials for higher limits"
              onPress={() => router.push("/profile/kyc-hub" as any)} 
              highlight
            />
            <MenuItem 
              icon="settings-outline" 
              label="Settings" 
              onPress={() => {}} 
            />
            <MenuItem 
              icon="help-circle-outline" 
              label="Help & Support" 
              onPress={() => {}} 
            />
            <MenuItem 
              icon="document-text-outline" 
              label="Terms of Service" 
              onPress={() => {}} 
            />
          </View>

          {/* Logout */}
          <TouchableOpacity 
            className="mx-5 bg-red-500/10 border border-red-500/30 rounded-2xl py-4 items-center"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="text-red-400 font-bold ml-2">Disconnect Wallet</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center">
      <Text className="text-xl mb-1">{icon}</Text>
      <Text className="text-white font-bold text-lg">{value}</Text>
      <Text className="text-white/40 text-xs">{label}</Text>
    </View>
  );
}

function BenefitRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-white/5">
      <Text className="text-white/60">{label}</Text>
      <Text className={`font-bold ${highlight ? "text-green-400" : "text-white"}`}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, subtitle, onPress, highlight }: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  subtitle?: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity 
      className={`flex-row items-center justify-between rounded-xl p-4 mb-2 ${
        highlight 
          ? "bg-indigo-500/10 border border-indigo-500/30" 
          : "bg-white/5 border border-white/10"
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          highlight ? "bg-indigo-500/20" : "bg-white/10"
        }`}>
          <Ionicons name={icon} size={20} color={highlight ? "#818cf8" : "rgba(255,255,255,0.6)"} />
        </View>
        <View>
          <Text className={highlight ? "text-white font-bold" : "text-white/80"}>{label}</Text>
          {subtitle && <Text className="text-white/40 text-xs">{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );
}

function formatWallet(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
