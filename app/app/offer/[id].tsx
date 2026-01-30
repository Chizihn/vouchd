import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "@apollo/client";
import { GET_OFFER_QUERY } from "@/graphql/queries";
import { INITIATE_TRADE_MUTATION } from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TierBadge } from "@/components/TierBadge";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency, formatCrypto } from "@/utils/helpers";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

export default function OfferDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = useAuthStore((state: any) => state.user);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: queryLoading } = useQuery(GET_OFFER_QUERY, {
    variables: { id },
  });

  const [createTrade] = useMutation(INITIATE_TRADE_MUTATION, {
    onCompleted: (data) => {
      router.push(`/trade/${data.initiateTrade.id}` as any);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
      setLoading(false);
    },
  });

  const offer = data?.offer;

  if (queryLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.background, alignItems: "center", justifyContent: "center" }}>
        <AppText className="text-white/50">Loading offer...</AppText>
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.background, alignItems: "center", justifyContent: "center" }}>
        <AppText className="text-white/50">Offer not found</AppText>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <AppText className="text-indigo-400">Go Back</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const seller = offer.seller;
  const isOwnOffer = user?.id === seller.id;

  const fiatAmount = amount ? parseFloat(amount) * offer.exchangeRate : 0;
  const isValidAmount = 
    amount && 
    parseFloat(amount) >= parseFloat(offer.minLimit) / offer.exchangeRate && 
    parseFloat(amount) <= parseFloat(offer.cryptoAmount);

  const handleTrade = async () => {
    if (!amount || !isValidAmount) {
      Alert.alert("Invalid Amount", "Please enter a valid amount within the limits.");
      return;
    }

    setLoading(true);
    try {
      await createTrade({
        variables: {
          offerId: id,
          amount: parseFloat(amount),
        },
      });
    } catch (error) {
      console.error("Trade error:", error);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <AppText weight="bold" className="text-white text-xl flex-1">Offer Details</AppText>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Seller Card */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-5">
            <View className="flex-row items-center mb-4">
              <View className="w-14 h-14 bg-indigo-500/20 rounded-full items-center justify-center mr-4 border border-indigo-500/30">
                <AppText className="text-2xl">👤</AppText>
              </View>
              <View className="flex-1">
                <AppText weight="bold" className="text-white text-lg">
                  {seller.username || "Anonymous Trader"}
                </AppText>
                <View className="flex-row items-center mt-1">
                  <TierBadge
                    tier={seller.fairTier}
                    score={seller.fairScore}
                    size="xs"
                  />
                </View>
              </View>
            </View>

            {/* Seller Stats */}
            <View className="flex-row justify-around pt-4 border-t border-white/10">
              <View className="items-center">
                <AppText weight="bold" className="text-white text-lg">{seller.totalTrades || 0}</AppText>
                <AppText variant="caption" className="text-white/40">Trades</AppText>
              </View>
              <View className="items-center">
                <AppText weight="bold" className="text-white text-lg">
                  {seller.completedTrades && seller.totalTrades 
                    ? Math.round((seller.completedTrades / seller.totalTrades) * 100) 
                    : 0}%
                </AppText>
                <AppText variant="caption" className="text-white/40">Completion</AppText>
              </View>
              <View className="items-center">
                <AppText weight="bold" className="text-white text-lg">
                  {seller.averageRating ? parseFloat(seller.averageRating).toFixed(1) : "N/A"}
                </AppText>
                <AppText variant="caption" className="text-white/40">Rating</AppText>
              </View>
            </View>
          </View>

          {/* Offer Details */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
            <AppText variant="label" className="text-white/40 mb-4">
              Offer Details
            </AppText>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-white/5">
                <AppText className="text-white/60">Asset</AppText>
                <AppText weight="bold" className="text-white">{offer.cryptoAsset}</AppText>
              </View>
              <View className="flex-row justify-between py-2 border-b border-white/5">
                <AppText className="text-white/60">Available</AppText>
                <AppText weight="bold" className="text-white">
                  {formatCrypto(offer.cryptoAmount, offer.cryptoAsset)}
                </AppText>
              </View>
              <View className="flex-row justify-between py-2 border-b border-white/5">
                <AppText className="text-white/60">Rate</AppText>
                <AppText weight="bold" className="text-green-400">
                  1 {offer.cryptoAsset} = {formatCurrency(offer.exchangeRate, offer.fiatCurrency)}
                </AppText>
              </View>
              <View className="flex-row justify-between py-2 border-b border-white/5">
                <AppText className="text-white/60">Payment Method</AppText>
                <AppText weight="bold" className="text-white">
                  {offer.paymentMethod.replace(/_/g, " ")}
                </AppText>
              </View>
              <View className="flex-row justify-between py-2">
                <AppText className="text-white/60">Limits</AppText>
                <AppText weight="bold" className="text-white">
                  {formatCurrency(offer.minLimit, offer.fiatCurrency)} - {formatCurrency(offer.maxLimit, offer.fiatCurrency)}
                </AppText>
              </View>
            </View>
          </View>

          {/* Terms */}
          {offer.terms && (
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
              <AppText variant="label" className="text-white/40 mb-3">
                Seller's Terms
              </AppText>
              <AppText className="text-white/70 leading-5">{offer.terms}</AppText>
            </View>
          )}

          {/* Trade Input */}
          {!isOwnOffer && (
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
              <AppText variant="label" className="text-white/40 mb-4">
                Enter Amount
              </AppText>

              <View className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-row items-center">
                <TextInput
                  className="flex-1 text-white text-xl font-bold"
                  style={{ fontFamily: "Outfit_700Bold" }}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <AppText weight="bold" className="text-white/60 ml-2">{offer.cryptoAsset}</AppText>
              </View>

              {amount && (
                <View className="mt-3 bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                  <AppText className="text-indigo-400 text-center">
                    You'll pay: <AppText weight="bold">{formatCurrency(fiatAmount, offer.fiatCurrency)}</AppText>
                  </AppText>
                </View>
              )}

              <View className="flex-row justify-between mt-3">
                <TouchableOpacity 
                   onPress={() => setAmount((parseFloat(offer.minLimit) / offer.exchangeRate).toFixed(6))}
                  className="bg-white/5 px-4 py-2 rounded-lg border border-white/10"
                >
                  <AppText variant="caption" className="text-white/60 uppercase">MIN</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setAmount((parseFloat(offer.cryptoAmount) / 2).toFixed(6))}
                  className="bg-white/5 px-4 py-2 rounded-lg border border-white/10"
                >
                  <AppText variant="caption" className="text-white/60 uppercase">50%</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setAmount(parseFloat(offer.cryptoAmount).toFixed(6))}
                  className="bg-white/5 px-4 py-2 rounded-lg border border-white/10"
                >
                  <AppText variant="caption" className="text-white/60 uppercase">MAX</AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Button */}
          <View className="mt-6 mb-8">
            {isOwnOffer ? (
              <View className="bg-white/5 rounded-2xl p-4 items-center border border-white/10">
                <AppText className="text-white/40">This is your own offer</AppText>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleTrade}
                disabled={!isValidAmount || loading}
                style={{ opacity: isValidAmount && !loading ? 1 : 0.5 }}
              >
                <LinearGradient
                  colors={["#6366f1", "#8b5cf6"]}
                  className="rounded-2xl py-4 items-center"
                   start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <AppText weight="bold" className="text-white text-lg">
                    {loading ? "Creating Trade..." : `Buy ${offer.cryptoAsset}`}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Safety Notice */}
          <View className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={18} color="#eab308" />
              <AppText weight="bold" className="text-yellow-500 ml-2">Escrow Protected</AppText>
            </View>
            <AppText variant="caption" className="text-yellow-500/70">
              Your funds will be held in a secure Solana escrow until the trade is completed.
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
