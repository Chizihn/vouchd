import React from "react";
import { View, Text } from "react-native";

export default function TierIcon({
  tier,
  size = 24,
}: {
  tier: string | null;
  size?: number;
}) {
  const getTierEmoji = (tier: string | null): string => {
    switch (tier) {
      case "DIAMOND":
        return "💎";
      case "GOLD":
        return "🏆";
      case "SILVER":
        return "⚪";
      case "BRONZE":
        return "🟤";
      default:
        return "⚫";
    }
  };

  return <Text style={{ fontSize: size }}>{getTierEmoji(tier)}</Text>;
}
