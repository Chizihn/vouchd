import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AppText } from "./ui/AppText";
import { getTierColor, getTierBgColor } from "@/utils/helpers";

interface TierBadgeProps {
  tier: string | null;
  score: number | null;
  starRating?: number | null;
  size?: "xs" | "sm" | "md" | "lg";
  showScore?: boolean;
  showStars?: boolean;
}

export function TierBadge({
  tier,
  score,
  starRating,
  size = "md",
  showScore = true,
  showStars = true,
}: TierBadgeProps) {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const tierColor = getTierColor(tier);
  const bgClass = getTierBgColor(tier);

  return (
    <View className="items-end">
      <View
        className={`${bgClass} rounded-full ${sizeClasses[size]} flex-row items-center`}
      >
        <View
          className="w-2 h-2 rounded-full mr-1.5"
          style={{ backgroundColor: tierColor }}
        />
        <AppText weight="semibold" style={{ color: tierColor }}>
          {tier || "UNVERIFIED"}
        </AppText>
        {showScore && score !== null && (
          <AppText variant="caption" className="ml-1 text-gray-600">({score})</AppText>
        )}
      </View>
      {showStars && starRating !== undefined && starRating !== null && (
        <View className="flex-row mt-0.5">
          {[...Array(5)].map((_, i) => (
            <Text
              key={i}
              className={`${size === "sm" ? "text-[8px]" : "text-[10px]"} ${
                i < starRating ? "text-yellow-500" : "text-gray-300"
              }`}
            >
              ★
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
