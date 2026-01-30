import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "@apollo/client";
import { RATE_TRADE_MUTATION } from "@/graphql/mutations";
import { formatCurrency, formatCrypto } from "@/utils/helpers";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
};

export default function TradeCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [scaleAnim] = useState(new Animated.Value(0));

  const [rateTrade] = useMutation(RATE_TRADE_MUTATION);

  React.useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmitRating = async () => {
    try {
      await rateTrade({
        variables: {
          tradeId: id,
          score: rating,
          comment,
          tags: rating >= 4 ? ["fast", "trustworthy"] : [],
        },
      });
      router.push("/(tabs)" as any);
    } catch (error) {
      console.error("Error rating trade:", error);
    }
  };

  // Mock trade data
  const trade = {
    id: id as string,
    cryptoAmount: 500,
    cryptoAsset: "USDC",
    fiatAmount: 412500,
    fiatCurrency: "NGN",
    rate: 825,
    fee: 2063,
    feePercentage: 0.005,
    netReceived: 410437,
    completedAt: new Date(),
    counterparty: {
      username: "@crypto_trader_ng",
      fairScore: 742,
      fairTier: "GOLD",
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="items-center pt-8">
            {/* Success Animation */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                className="w-32 h-32 rounded-full items-center justify-center mb-4"
              >
                <AppText className="text-white text-6xl">✓</AppText>
              </LinearGradient>
            </Animated.View>

            {/* Confetti Effect */}
            <View className="absolute top-12 left-0 right-0 flex-row justify-around">
              <AppText className="text-2xl">🎉</AppText>
              <AppText className="text-2xl">✨</AppText>
              <AppText className="text-2xl">🎊</AppText>
              <AppText className="text-2xl">⭐</AppText>
            </View>

            <AppText weight="bold" className="text-3xl text-white mb-1">
              Trade Completed!
            </AppText>
            <AppText className="text-white/40 mb-8">Successfully exchanged</AppText>

            {/* Amount Display */}
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-6">
              <View className="flex-row items-center justify-center mb-2">
                <AppText weight="bold" className="text-2xl text-white">
                  {formatCrypto(trade.cryptoAmount, trade.cryptoAsset)}
                </AppText>
                <AppText className="text-2xl text-white/40 mx-3">↔</AppText>
                <AppText weight="bold" className="text-2xl text-white">
                  {formatCurrency(trade.fiatAmount, trade.fiatCurrency)}
                </AppText>
              </View>
              <AppText variant="caption" className="text-white/40 text-center">
                Rate: {formatCurrency(trade.rate, trade.fiatCurrency)}/
                {trade.cryptoAsset}
              </AppText>
            </View>

            {/* Summary Card */}
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-6">
              <AppText weight="semibold" className="text-white mb-4">Summary</AppText>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <AppText className="text-white/60">Trade ID</AppText>
                  <AppText weight="medium" className="text-white">
                    #{trade.id.slice(0, 8)}
                  </AppText>
                </View>
                <View className="flex-row justify-between">
                  <AppText className="text-white/60">Completed</AppText>
                  <AppText weight="medium" className="text-white">Just now</AppText>
                </View>
                <View className="flex-row justify-between">
                  <AppText className="text-white/60">
                    Fee ({trade.feePercentage * 100}%)
                  </AppText>
                  <AppText weight="medium" className="text-white">
                    {formatCurrency(trade.fee, trade.fiatCurrency)}
                  </AppText>
                </View>
                <View className="border-t border-white/10 pt-3 flex-row justify-between">
                  <AppText weight="semibold" className="text-white">Net received</AppText>
                  <AppText weight="bold" className="text-green-400 text-lg">
                    {formatCurrency(trade.netReceived, trade.fiatCurrency)}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Rate Experience */}
            <View className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 w-full mb-6">
              <AppText weight="semibold" className="text-white mb-4">
                Traded with {trade.counterparty.username}
              </AppText>

              <AppText className="text-white/60 mb-3">Rate your experience</AppText>

              <View className="flex-row justify-center mb-4 space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <AppText
                      className={`text-4xl ${rating >= star ? "" : "opacity-30"}`}
                    >
                      ⭐
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <View className="bg-white/5 rounded-lg p-3">
                  <AppText variant="caption" className="text-white/60 mb-2">
                    Optional feedback
                  </AppText>
                  <AppText className="text-white/40 italic">
                    {rating === 5
                      ? "Excellent!"
                      : rating === 4
                        ? "Good!"
                        : rating === 3
                          ? "Okay"
                          : "Could be better"}
                  </AppText>
                </View>
              )}
            </View>

            {/* Progress to Next Tier */}
            <LinearGradient
              colors={["#8b5cf6", "#6366f1"]}
              className="rounded-2xl p-6 w-full mb-6"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppText weight="bold" className="text-white text-lg mb-4">
                You've completed 23 trades! 🎊
              </AppText>

              <View className="bg-white/20 rounded-lg p-4 mb-3">
                <AppText className="text-white text-sm mb-2">
                  Progress to Gold tier
                </AppText>
                <View className="h-3 bg-white/30 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: "84%" }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <AppText variant="caption" className="text-white">687</AppText>
                  <AppText variant="caption" className="text-white">750 (Gold)</AppText>
                </View>
              </View>

              <View className="bg-white/20 rounded-lg p-3">
                <AppText weight="semibold" className="text-white">
                  63 points to Gold tier!
                </AppText>
                <AppText variant="caption" className="text-white/80">
                  Complete 5 more trades to unlock
                </AppText>
              </View>
            </LinearGradient>

            {/* Action Buttons */}
            <View className="w-full space-y-3">
              <TouchableOpacity
                onPress={handleSubmitRating}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  className="rounded-2xl py-4"
                >
                  <AppText weight="bold" className="text-white text-center text-lg">
                    Trade Again
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                className="border-2 border-white/20 rounded-2xl py-4"
                onPress={() => {
                  /* Open Solscan */
                }}
              >
                <AppText weight="semibold" className="text-white/70 text-center">
                  View Transaction on Solscan
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity className="border-2 border-indigo-500/50 rounded-2xl py-4">
                <AppText weight="semibold" className="text-indigo-400 text-center">
                  Share 🔗
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
