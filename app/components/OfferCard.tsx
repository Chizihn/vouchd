import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TierBadge } from "./TierBadge";
import {
  formatCurrency,
  formatCrypto,
  calculateCompletionRate,
} from "@/utils/helpers";

interface OfferCardProps {
  offer: {
    id: string;
    cryptoAsset: string;
    cryptoAmount: number;
    fiatCurrency: string;
    fiatAmount: number;
    exchangeRate: number;
    paymentMethod: string;
    minLimit: number;
    maxLimit: number;
    seller: {
      fairScore: number | null;
      fairTier: string | null;
      starRating?: number | null;
      username: string | null;
      averageRating: number;
      completedTrades: number;
      totalTrades: number;
    };
  };
  onPress: () => void;
}

export function OfferCard({ offer, onPress }: OfferCardProps) {
  const completionRate = calculateCompletionRate(
    offer.seller.completedTrades,
    offer.seller.totalTrades,
  );

  const isHighlyTrusted = offer.seller.fairTier === "GOLD" || offer.seller.fairTier === "DIAMOND";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="glass rounded-2xl p-4 mb-4 border border-white/5 active:opacity-80"
    >
      {/* Highly Trusted Indicator */}
      {isHighlyTrusted && (
        <View className="flex-row items-center mb-2 bg-green-500/10 self-start px-2 py-0.5 rounded-md">
          <Text className="text-pillarHigh text-[8px] font-black uppercase">Highly Trusted Seller</Text>
        </View>
      )}

      {/* Seller Info */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10">
            <Text className="text-lg">👤</Text>
          </View>
          <View className="ml-3">
            <Text className="font-bold text-white text-base">
              {offer.seller.username || (offer.seller.fairScore ? `Trader #${offer.seller.fairScore}` : "New Trader")}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white/40 text-[10px] font-bold uppercase">
                {offer.seller.completedTrades} TRADES • {completionRate}% RATE
              </Text>
            </View>
          </View>
        </View>
        <TierBadge
          tier={offer.seller.fairTier}
          score={offer.seller.fairScore}
          starRating={offer.seller.starRating}
          size="xs"
        />
      </View>

      {/* Offer Details */}
      <View className="bg-white/5 rounded-xl p-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-2xl font-black text-white">
            {formatCurrency(offer.fiatAmount, offer.fiatCurrency)}
          </Text>
          <Text className="text-white/60 font-mono text-xs">
            {formatCrypto(offer.cryptoAmount, offer.cryptoAsset)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-white/5">
          <View className="bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
            <Text className="text-blue-400 text-[10px] font-bold uppercase">
              {offer.paymentMethod.replace(/_/g, " ")}
            </Text>
          </View>
          <Text className="text-white/30 text-[10px] font-bold">
            LIMIT: {formatCurrency(offer.minLimit, offer.fiatCurrency)} —{" "}
            {formatCurrency(offer.maxLimit, offer.fiatCurrency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
