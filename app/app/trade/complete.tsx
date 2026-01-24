import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
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
                <Text className="text-white text-6xl">✓</Text>
              </LinearGradient>
            </Animated.View>

            {/* Confetti Effect */}
            <View className="absolute top-12 left-0 right-0 flex-row justify-around">
              <Text className="text-2xl">🎉</Text>
              <Text className="text-2xl">✨</Text>
              <Text className="text-2xl">🎊</Text>
              <Text className="text-2xl">⭐</Text>
            </View>

            <Text className="text-3xl font-bold text-white mb-1">
              Trade Completed!
            </Text>
            <Text className="text-white/40 mb-8">Successfully exchanged</Text>

            {/* Amount Display */}
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-6">
              <View className="flex-row items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-white">
                  {formatCrypto(trade.cryptoAmount, trade.cryptoAsset)}
                </Text>
                <Text className="text-2xl text-white/40 mx-3">↔</Text>
                <Text className="text-2xl font-bold text-white">
                  {formatCurrency(trade.fiatAmount, trade.fiatCurrency)}
                </Text>
              </View>
              <Text className="text-sm text-white/40 text-center">
                Rate: {formatCurrency(trade.rate, trade.fiatCurrency)}/
                {trade.cryptoAsset}
              </Text>
            </View>

            {/* Summary Card */}
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-6">
              <Text className="font-semibold text-white mb-4">Summary</Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-white/60">Trade ID</Text>
                  <Text className="font-medium text-white">
                    #{trade.id.slice(0, 8)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white/60">Completed</Text>
                  <Text className="font-medium text-white">Just now</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white/60">
                    Fee ({trade.feePercentage * 100}%)
                  </Text>
                  <Text className="font-medium text-white">
                    {formatCurrency(trade.fee, trade.fiatCurrency)}
                  </Text>
                </View>
                <View className="border-t border-white/10 pt-3 flex-row justify-between">
                  <Text className="font-semibold text-white">Net received</Text>
                  <Text className="font-bold text-green-400 text-lg">
                    {formatCurrency(trade.netReceived, trade.fiatCurrency)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Rate Experience */}
            <View className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 w-full mb-6">
              <Text className="font-semibold text-white mb-4">
                Traded with {trade.counterparty.username}
              </Text>

              <Text className="text-white/60 mb-3">Rate your experience</Text>

              <View className="flex-row justify-center mb-4 space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text
                      className={`text-4xl ${rating >= star ? "" : "opacity-30"}`}
                    >
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <View className="bg-white/5 rounded-lg p-3">
                  <Text className="text-white/60 text-sm mb-2">
                    Optional feedback
                  </Text>
                  <Text className="text-white/40 italic">
                    {rating === 5
                      ? "Excellent!"
                      : rating === 4
                        ? "Good!"
                        : rating === 3
                          ? "Okay"
                          : "Could be better"}
                  </Text>
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
              <Text className="text-white font-bold text-lg mb-4">
                You've completed 23 trades! 🎊
              </Text>

              <View className="bg-white/20 rounded-lg p-4 mb-3">
                <Text className="text-white text-sm mb-2">
                  Progress to Gold tier
                </Text>
                <View className="h-3 bg-white/30 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: "84%" }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white text-xs">687</Text>
                  <Text className="text-white text-xs">750 (Gold)</Text>
                </View>
              </View>

              <View className="bg-white/20 rounded-lg p-3">
                <Text className="text-white font-semibold">
                  63 points to Gold tier!
                </Text>
                <Text className="text-white/80 text-sm">
                  Complete 5 more trades to unlock
                </Text>
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
                  <Text className="text-white font-bold text-center text-lg">
                    Trade Again
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                className="border-2 border-white/20 rounded-2xl py-4"
                onPress={() => {
                  /* Open Solscan */
                }}
              >
                <Text className="text-white/70 font-semibold text-center">
                  View Transaction on Solscan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="border-2 border-indigo-500/50 rounded-2xl py-4">
                <Text className="text-indigo-400 font-semibold text-center">
                  Share 🔗
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
