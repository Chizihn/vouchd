import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@apollo/client";
import { GET_OFFERS_QUERY } from "@/graphql/queries";
import { OfferCard } from "@/components/OfferCard";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SkeletonList } from "@/components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

// Mock buy requests for "Sell Crypto" tab (people wanting to buy crypto from you)
const MOCK_BUY_REQUESTS = [
  {
    id: "buy-1",
    cryptoAsset: "USDC",
    cryptoAmount: 500,
    fiatCurrency: "USD",
    fiatAmount: 495,
    exchangeRate: 0.99,
    paymentMethod: "BANK_TRANSFER",
    minLimit: 50,
    maxLimit: 500,
    buyer: {
      id: "buyer-1",
      walletAddress: "Buyer1...abc",
      fairScore: 720,
      fairTier: "GOLD",
      starRating: 4,
      username: "TrustedBuyer",
      averageRating: 4.8,
      completedTrades: 42,
      totalTrades: 45,
    },
  },
  {
    id: "buy-2",
    cryptoAsset: "SOL",
    cryptoAmount: 10,
    fiatCurrency: "USD",
    fiatAmount: 980,
    exchangeRate: 98,
    paymentMethod: "MOBILE_MONEY",
    minLimit: 100,
    maxLimit: 1000,
    buyer: {
      id: "buyer-2",
      walletAddress: "Buyer2...xyz",
      fairScore: 550,
      fairTier: "SILVER",
      starRating: 3,
      username: "SolanaSam",
      averageRating: 4.2,
      completedTrades: 18,
      totalTrades: 20,
    },
  },
  {
    id: "buy-3",
    cryptoAsset: "USDT",
    cryptoAmount: 1000,
    fiatCurrency: "USD",
    fiatAmount: 990,
    exchangeRate: 0.99,
    paymentMethod: "PAYPAL",
    minLimit: 100,
    maxLimit: 1000,
    buyer: {
      id: "buyer-3",
      walletAddress: "Buyer3...def",
      fairScore: 850,
      fairTier: "DIAMOND",
      starRating: 5,
      username: "DiamondDan",
      averageRating: 4.95,
      completedTrades: 156,
      totalTrades: 158,
    },
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const [activeTab, setActiveTab] = useState<"BUY" | "SELL">("BUY");
  const [selectedAsset, setSelectedAsset] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery(GET_OFFERS_QUERY, {
    variables: {
      cryptoAsset: selectedAsset === "All" ? null : selectedAsset,
      limit: 20,
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const assets = ["All", "USDC", "SOL", "USDT"];

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-black text-white">VOUCHD</Text>
              <Text className="text-white/30 text-xs">P2P Trust Engine</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {user && (
                <View className="bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-full flex-row items-center">
                  <Text className="text-indigo-400 text-xs font-bold">{user.fairTier || "NEW"}</Text>
                  <Text className="text-white ml-1 text-xs">• {user.fairScore || 0}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Search */}
          <View className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
            <TextInput
              className="flex-1 text-white ml-3"
              placeholder="Search offers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Buy/Sell Toggle */}
          <View className="flex-row bg-white/5 rounded-xl p-1 mb-4">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "BUY" ? "bg-green-500" : ""}`}
              onPress={() => setActiveTab("BUY")}
            >
              <Text className={`text-center font-bold ${activeTab === "BUY" ? "text-white" : "text-white/40"}`}>
                Buy Crypto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "SELL" ? "bg-red-500" : ""}`}
              onPress={() => setActiveTab("SELL")}
            >
              <Text className={`text-center font-bold ${activeTab === "SELL" ? "text-white" : "text-white/40"}`}>
                Sell Crypto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Asset Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {assets.map((asset) => (
              <TouchableOpacity
                key={asset}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedAsset === asset 
                    ? "bg-indigo-500" 
                    : "bg-white/5 border border-white/10"
                }`}
                onPress={() => setSelectedAsset(asset)}
              >
                <Text className={`text-xs font-bold ${
                  selectedAsset === asset ? "text-white" : "text-white/50"
                }`}>
                  {asset}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Offers List */}
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
          <View className="flex-row justify-between items-center py-4">
            <Text className="text-white/40 text-xs font-bold uppercase">
              {activeTab === "BUY" 
                ? `${data?.offers?.length || 0} Offers Available`
                : `${MOCK_BUY_REQUESTS.length} Buy Requests`
              }
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-indigo-400 text-xs font-bold mr-1">Sort by Score</Text>
              <Ionicons name="chevron-down" size={14} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <SkeletonList count={4} />
          ) : activeTab === "BUY" ? (
            // Buy Crypto Tab - Show sell offers
            data?.offers?.length === 0 ? (
              <View className="items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Text className="text-4xl mb-4">📭</Text>
                <Text className="text-white font-bold text-lg mb-2">No Offers Yet</Text>
                <Text className="text-white/40 text-sm text-center px-8 mb-6">
                  Be the first to create an offer and start trading!
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/create")}
                >
                  <LinearGradient
                    colors={["#6366f1", "#8b5cf6"]}
                    className="px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-bold">Create Offer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-4 pb-4">
                {data?.offers?.map((offer: any) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onPress={() => router.push(`/offer/${offer.id}` as any)}
                  />
                ))}
              </View>
            )
          ) : (
            // Sell Crypto Tab - Show buy requests
            <View className="gap-4 pb-4">
              {MOCK_BUY_REQUESTS.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  onPress={() => Alert.alert(
                    "Sell to Buyer",
                    `${request.buyer.username} wants to buy ${request.cryptoAmount} ${request.cryptoAsset} for $${request.fiatAmount}. Accept this request?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Accept", onPress: () => router.push("/(tabs)/create") }
                    ]
                  )}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                        <Text className="text-lg">
                          {request.cryptoAsset === "USDC" ? "💵" : request.cryptoAsset === "SOL" ? "◎" : "💲"}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white font-bold">
                          Wants {request.cryptoAmount} {request.cryptoAsset}
                        </Text>
                        <Text className="text-white/40 text-sm">
                          Paying ${request.fiatAmount} {request.fiatCurrency}
                        </Text>
                      </View>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${
                      request.buyer.fairTier === "DIAMOND" ? "bg-cyan-500/20" :
                      request.buyer.fairTier === "GOLD" ? "bg-yellow-500/20" :
                      request.buyer.fairTier === "SILVER" ? "bg-gray-400/20" : "bg-orange-500/20"
                    }`}>
                      <Text className={`text-xs font-bold ${
                        request.buyer.fairTier === "DIAMOND" ? "text-cyan-400" :
                        request.buyer.fairTier === "GOLD" ? "text-yellow-400" :
                        request.buyer.fairTier === "SILVER" ? "text-gray-300" : "text-orange-400"
                      }`}>
                        {request.buyer.fairTier}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between pt-3 border-t border-white/5">
                    <View className="flex-row items-center">
                      <Text className="text-white/60 text-sm">@{request.buyer.username}</Text>
                      <Text className="text-white/30 mx-2">•</Text>
                      <Text className="text-green-400 text-sm">{request.buyer.completedTrades} trades</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text className="text-white/60 text-sm ml-1">{request.buyer.averageRating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
