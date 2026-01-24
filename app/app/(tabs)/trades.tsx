import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@apollo/client";
import { GET_MY_TRADES_QUERY } from "@/graphql/queries";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SkeletonList } from "@/components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  PENDING: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: "⏳" },
  ESCROWED: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: "🔒" },
  FIAT_SENT: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: "💸" },
  COMPLETED: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "✅" },
  CANCELLED: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "❌" },
  DISPUTED: { color: "#f97316", bg: "rgba(249,115,22,0.1)", icon: "⚠️" },
};

export default function TradesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery(GET_MY_TRADES_QUERY, {
    variables: { status: activeFilter },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filters = [
    { key: null, label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "ESCROWED", label: "Active" },
    { key: "COMPLETED", label: "Done" },
  ];

  const trades = data?.myTrades || [];

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-white mb-1">My Trades</Text>
          <Text className="text-white/40 text-sm mb-4">Track your active and past trades</Text>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key || "all"}
                className={`px-4 py-2 rounded-full mr-2 ${
                  activeFilter === filter.key 
                    ? "bg-indigo-500" 
                    : "bg-white/5 border border-white/10"
                }`}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text className={`text-xs font-bold ${
                  activeFilter === filter.key ? "text-white" : "text-white/50"
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trades List */}
        <ScrollView 
          className="flex-1 px-5" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#6366f1"
            />
          }
        >
          <View className="py-4">
            {loading ? (
              <SkeletonList count={4} />
            ) : trades.length === 0 ? (
              <View className="items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Text className="text-4xl mb-4">📊</Text>
                <Text className="text-white font-bold text-lg mb-2">No Trades Yet</Text>
                <Text className="text-white/40 text-sm text-center px-8 mb-6">
                  Start trading by browsing offers in the marketplace
                </Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)" as any)}>
                  <LinearGradient
                    colors={["#6366f1", "#8b5cf6"]}
                    className="px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-bold">Browse Offers</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-3">
                {trades.map((trade: any) => (
                  <TradeCard 
                    key={trade.id} 
                    trade={trade} 
                    onPress={() => router.push(`/trade/${trade.id}`)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TradeCard({ trade, onPress }: { trade: any; onPress: () => void }) {
  const config = STATUS_CONFIG[trade.status] || STATUS_CONFIG.PENDING;
  const isBuyer = trade.buyer?.id === trade.buyerId;

  return (
    <TouchableOpacity
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-3">
            <Text className="text-lg">{trade.offer?.cryptoAsset === "SOL" ? "◎" : "💵"}</Text>
          </View>
          <View>
            <Text className="text-white font-bold">
              {trade.cryptoAmount} {trade.offer?.cryptoAsset || "USDC"}
            </Text>
            <Text className="text-white/40 text-xs">
              ${trade.fiatAmount?.toLocaleString()} {trade.offer?.fiatCurrency || "USD"}
            </Text>
          </View>
        </View>
        <View 
          className="px-3 py-1.5 rounded-full flex-row items-center"
          style={{ backgroundColor: config.bg }}
        >
          <Text className="mr-1">{config.icon}</Text>
          <Text style={{ color: config.color }} className="text-xs font-bold">
            {trade.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={12} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/40 text-xs ml-1">
            {isBuyer ? "Buying from " : "Selling to "} 
            {(isBuyer ? trade.seller?.username : trade.buyer?.username) || "Trader"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
      </View>
    </TouchableOpacity>
  );
}
