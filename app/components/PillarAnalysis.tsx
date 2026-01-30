import React from "react";
import { View, Text } from "react-native";
import { AppText } from "./ui/AppText";

interface Pillar {
  score: number;
  label: "Low" | "Medium" | "High";
}

interface PillarAnalysisProps {
  pillars: {
    economy: Pillar;
    risk: Pillar;
    activity: Pillar;
    diversification: Pillar;
    social: Pillar;
  };
}

export function PillarAnalysis({ pillars }: PillarAnalysisProps) {
  if (!pillars) return null;

  return (
    <View className="space-y-4">
      <PillarRow label="Economy" pillar={pillars.economy} />
      <PillarRow label="Risk Control" pillar={pillars.risk} />
      <PillarRow label="Activity" pillar={pillars.activity} />
      <PillarRow label="Diversification" pillar={pillars.diversification} />
      <PillarRow label="Social Status" pillar={pillars.social} />
    </View>
  );
}

function PillarRow({ label, pillar }: { label: string; pillar: Pillar }) {
  const getPillarColor = (score: number) => {
    if (score >= 700) return "#10B981"; // Green
    if (score >= 400) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const progress = Math.max(5, (pillar.score / 1000) * 100);
  const color = getPillarColor(pillar.score);

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <AppText variant="caption" weight="bold" className="text-white/60 uppercase tracking-wider">{label}</AppText>
        <AppText variant="caption" weight="bold" style={{ color }}>{pillar.label}</AppText>
      </View>
      <View className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full" 
          style={{ width: `${progress}%`, backgroundColor: color }} 
        />
      </View>
    </View>
  );
}
