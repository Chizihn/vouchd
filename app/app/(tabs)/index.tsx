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
import { AppText } from "@/components/ui/AppText";
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
              <AppText weight="extrabold" className="text-3xl text-white">VOUCHD</AppText>
              <AppText variant="caption" className="text-white/30">P2P Trust Engine</AppText>
            </View>
            <View className="flex-row items-center gap-2">
              {user && (
                <View className="bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-full flex-row items-center">
                  <AppText weight="bold" className="text-indigo-400 text-xs">{user.fairTier || "NEW"}</AppText>
                  <AppText variant="caption" className="text-white ml-1">• {user.fairScore || 0}</AppText>
                </View>
              )}
            </View>
          </View>

          {/* Search */}
          <View className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
            <TextInput
              className="flex-1 text-white ml-3"
              style={{ fontFamily: 'Outfit_400Regular' }}
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
              <AppText weight="bold" className={`text-center ${activeTab === "BUY" ? "text-white" : "text-white/40"}`}>
                Buy Crypto
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "SELL" ? "bg-red-500" : ""}`}
              onPress={() => setActiveTab("SELL")}
            >
              <AppText weight="bold" className={`text-center ${activeTab === "SELL" ? "text-white" : "text-white/40"}`}>
                Sell Crypto
              </AppText>
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
                <AppText weight="bold" className={`text-xs ${
                  selectedAsset === asset ? "text-white" : "text-white/50"
                }`}>
                  {asset}
                </AppText>
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
            <AppText variant="label" className="text-white/40">
              {activeTab === "BUY" 
                ? `${data?.offers?.length || 0} Offers Available`
                : `${MOCK_BUY_REQUESTS.length} Buy Requests`
              }
            </AppText>
            <TouchableOpacity className="flex-row items-center">
              <AppText variant="caption" weight="bold" className="text-indigo-400 mr-1">Sort by Score</AppText>
              <Ionicons name="chevron-down" size={14} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <SkeletonList count={4} />
          ) : activeTab === "BUY" ? (
            // Buy Crypto Tab - Show sell offers
            data?.offers?.length === 0 ? (
              <View className="items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <AppText className="text-4xl mb-4">📭</AppText>
                <AppText weight="bold" className="text-white text-lg mb-2">No Offers Yet</AppText>
                <AppText variant="caption" className="text-white/40 text-center px-8 mb-6">
                  Be the first to create an offer and start trading!
                </AppText>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/create")}
                >
                  <LinearGradient
                    colors={["#6366f1", "#8b5cf6"]}
                    className="px-6 py-3 rounded-xl"
                  >
                    <AppText weight="bold" className="text-white">Create Offer</AppText>
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
                        <AppText className="text-lg">
                          {request.cryptoAsset === "USDC" ? "💵" : request.cryptoAsset === "SOL" ? "◎" : "💲"}
                        </AppText>
                      </View>
                      <View>
                        <AppText weight="bold" className="text-white">
                          Wants {request.cryptoAmount} {request.cryptoAsset}
                        </AppText>
                        <AppText variant="caption" className="text-white/40">
                          Paying ${request.fiatAmount} {request.fiatCurrency}
                        </AppText>
                      </View>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${
                      request.buyer.fairTier === "DIAMOND" ? "bg-cyan-500/20" :
                      request.buyer.fairTier === "GOLD" ? "bg-yellow-500/20" :
                      request.buyer.fairTier === "SILVER" ? "bg-gray-400/20" : "bg-orange-500/20"
                    }`}>
                      <AppText weight="bold" className={`text-xs ${
                        request.buyer.fairTier === "DIAMOND" ? "text-cyan-400" :
                        request.buyer.fairTier === "GOLD" ? "text-yellow-400" :
                        request.buyer.fairTier === "SILVER" ? "text-gray-300" : "text-orange-400"
                      }`}>
                        {request.buyer.fairTier}
                      </AppText>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between pt-3 border-t border-white/5">
                    <View className="flex-row items-center">
                      <AppText variant="caption" className="text-white/60">@{request.buyer.username}</AppText>
                      <AppText variant="caption" className="text-white/30 mx-2">•</AppText>
                      <AppText variant="caption" weight="medium" className="text-green-400">{request.buyer.completedTrades} trades</AppText>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <AppText variant="caption" className="text-white/60 ml-1">{request.buyer.averageRating}</AppText>
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
