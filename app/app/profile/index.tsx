import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME_QUERY } from "@/graphql/queries";
import { REFRESH_FAIRSCORE_MUTATION } from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { getTierColor, getTierBgColor } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { TierBadge } from "@/components/TierBadge";

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { data, loading, refetch } = useQuery(GET_ME_QUERY);
  const [refreshScore, { loading: refreshing }] = useMutation(REFRESH_FAIRSCORE_MUTATION, {
    onCompleted: () => {
      refetch();
      setKycModalVisible(false);
    },
  });
  
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [impactMode, setImpactMode] = useState(false);
  
  const realUser = data?.me;
  
  // Bounty Impact Mode Mock Data
  const mockWhale = {
    ...realUser,
    username: "SolanaWhale.sol",
    fairScore: 942,
    fairTier: "DIAMOND",
    completedTrades: 124,
    airdropPredictions: [
      "🚀 Top 1% for JUP/PYTH style activity criteria",
      "💰 Whale Tier: Eligible for max allocation in Drift launchpad",
      "🌐 Ecosystem Legend: Trusted by 15+ Solana protocols"
    ],
    safetyInsight: "💎 Institutional Grade: This user maintains high stablecoin liquidity and native SOL balance. Highly reliable for large trades."
  };

  const user = impactMode ? mockWhale : realUser;

  if (!user) return null;

  const tierColor = getTierColor(user.fairTier);

  return (
    <ScrollView className="flex-1 bg-dark">
      {/* Header section with Glass background overlay */}
      {/* Back Button */}
        <TouchableOpacity
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-full items-center justify-center m-5"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

      <View className="pt-16 pb-12 px-6 items-center">
        <View className="absolute top-0 left-0 right-0 h-48 bg-secondary/10" />
        
        {/* Bounty Impact Mode Toggle */}
        <View className="flex-row items-center justify-between w-full mb-8 bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
           <View>
              <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Bounty Impact Mode</Text>
              <Text className="text-white/40 text-[8px]">Simulation: Newbie vs Whale</Text>
           </View>
           <Switch 
            value={impactMode} 
            onValueChange={setImpactMode}
            trackColor={{ false: "#1f2937", true: "#3b82f6" }}
           />
        </View>

        {/* User Info */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 items-center justify-center mb-4 overflow-hidden">
             <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-3xl font-bold text-white mb-1">
             {user.username || user.walletAddress.slice(0, 8)}
          </Text>
          <View className="bg-white/10 px-3 py-1 rounded-full border border-white/10 mb-4">
            <Text className="text-white/60 text-xs font-mono">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </Text>
          </View>

          {/* Universal Trust Seal - Wow Feature */}
          <TouchableOpacity 
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex-row items-center"
            onPress={() => Alert.alert("Trust Seal Active", `Public profile link created: vouchd.xyz/trust/${user.walletAddress.slice(0, 8)}`)}
          >
             <Text className="mr-2">📜</Text>
             <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Generate Public Trust Seal</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Score Gauge */}
        <View className="items-center mb-8">
           <View className="w-56 h-56 rounded-full border-[10px] border-white/5 items-center justify-center relative shadow-2xl">
              <View 
                className="absolute inset-0 rounded-full border-[10px]" 
                style={{ 
                  borderColor: tierColor,
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                  transform: [{ rotate: '45deg' }]
                }} 
              />
              <View className="items-center">
                <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Your Score</Text>
                <Text className="text-6xl font-black text-white">{user.fairScore || 0}</Text>
                <Text className="text-white/50 text-sm">/ 1000</Text>
                <View className="mt-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                   <Text className="text-[10px] font-bold" style={{ color: tierColor }}>{user.fairTier} TIER</Text>
                </View>
              </View>
           </View>
        </View>

        {/* Global Stats Bar */}
        <View className="flex-row w-full justify-around glass rounded-2xl py-4 px-2">
           <StatItem label={user.fairTier} sub="Tier Status" />
           <View className="w-[1px] h-8 bg-white/10" />
           <StatItem label="Top 5%" sub="User Percentile" />
           <View className="w-[1px] h-8 bg-white/10" />
           <StatItem label={user.completedTrades.toString()} sub="Completed Trades" />
        </View>
      </View>

      <View className="px-6 pb-20">
        {/* Airdrop & DeFi Capability - Wow Feature */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Ecosystem Eligibility</Text>
        <View className="glass rounded-2xl p-6 border border-primary/20 bg-primary/5">
           <Text className="text-primary text-[10px] font-bold uppercase tracking-widest mb-3">Powered by FairScale Insights</Text>
           <View className="space-y-3">
              {(user.airdropPredictions && user.airdropPredictions.length > 0) ? user.airdropPredictions.map((prediction: string, i: number) => (
                <View key={i} className="flex-row items-center">
                  <Text className="mr-2">✨</Text>
                  <Text className="text-white/80 text-sm italic">{prediction}</Text>
                </View>
              )) : (
                <Text className="text-white/40 text-xs italic">Complete more trades to unlock ecosystem predictions.</Text>
              )}
           </View>
        </View>

        {/* Score Pillars */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Score Pillars</Text>
        <View className="flex-row flex-wrap justify-between">
           <PillarBox label="Economy" status={user.pillars?.economy?.label || "Low"} color="pillarLow" width="w-[31%]" />
           <PillarBox label="Risk" status={user.pillars?.risk?.label || "Medium"} color="pillarMedium" width="w-[31%]" />
           <PillarBox label="Activity" status={user.pillars?.activity?.label || "Low"} color="pillarLow" width="w-[31%]" />
           <PillarBox label="Diversification" status={user.pillars?.diversification?.label || "Low"} color="pillarLow" width="w-[48%] mt-3" />
           <PillarBox label="Social" status={user.pillars?.social?.label || "Low"} color="pillarLow" width="w-[48%] mt-3" />
        </View>

        {/* Activity Center - Wow Feature */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Trust Timeline</Text>
        <View className="glass rounded-2xl p-6">
           <TimelineItem icon="📈" title="FairScore Increase" sub="+42 points for fast escrow release" time="2h ago" />
           <TimelineItem icon="🛡️" title="KYC Verified" sub="Identity verified via Twitter" time="1d ago" />
           <TimelineItem icon="🤝" title="First Trade" sub="Completed buy order with Gold Seller" time="3d ago" />
        </View>

        {/* Reputation Dividends - Wow Feature */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Reputation Dividends</Text>
        <View className="glass rounded-2xl p-6 bg-yellow-500/5 border border-yellow-500/20">
           <View className="flex-row justify-between items-center">
              <View>
                 <Text className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Multiplier</Text>
                 <Text className="text-3xl font-black text-white">{user.fairTier === 'DIAMOND' ? '1.50x' : '1.25x'}</Text>
              </View>
              <View className="items-end">
                 <Text className="text-white/40 text-[10px] uppercase font-bold mb-1">Estimated Earnings</Text>
                 <Text className="text-lg font-bold text-green-400">{user.fairTier === 'DIAMOND' ? '+$120.00' : '+$42.50'} / mo</Text>
              </View>
           </View>
           <Text className="text-white/40 text-[10px] mt-4 italic">Your {user.fairTier} tier grants you a rewards boost on all protocol operations.</Text>
        </View>

        {/* Flash Trust - Wow Feature */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Flash Trust</Text>
        <TouchableOpacity 
          className="glass rounded-2xl p-6 border border-blue-500/20 bg-blue-500/5 flex-row items-center justify-between"
          onPress={() => Alert.alert("Flash Trust", "Lock 5 SOL as collateral to temporarily boost your reputation tier for 7 days.")}
        >
           <View className="flex-1">
              <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Temporary Rep Boost</Text>
              <Text className="text-white font-bold text-base">Boost to Diamond Tier</Text>
              <Text className="text-white/40 text-[10px] mt-1">Rent a higher tier by providing economic skin in the game.</Text>
           </View>
           <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-white">🚀</Text>
           </View>
        </TouchableOpacity>

        {/* Recommended Actions */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Recommended Actions</Text>
        <View className="space-y-3">
           <ActionItem 
            title="Connect Your Socials" 
            sub="Link your Twitter to boost your score" 
            priority="HIGH" 
            onPress={() => setKycModalVisible(true)} 
           />
           <ActionItem 
            title="Hold Positions Longer" 
            sub="Diamond hands hold for 30+ days" 
            priority="MEDIUM" 
            onPress={() => {}} 
           />
           <ActionItem 
            title="Increase Trade Volume" 
            sub="Regular trading builds Activity score" 
            priority="LOW" 
            onPress={() => router.push("/(tabs)" as any)} 
           />
        </View>

        {/* Unlocked Perks */}
        <Text className="text-xl font-bold text-white mt-8 mb-4">Your Unlocked Perks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-4">
           <PerkCard title="KAST" sub="Access benefits" icon="💳" />
           <PerkCard title="SurfCash" sub="Zero fees" icon="🌊" />
           <PerkCard title="ThexBank" sub="Premium yields" icon="🏦" />
        </ScrollView>

        {/* Settings/Logout */}
        <TouchableOpacity 
          className="mt-12 glass rounded-2xl p-4 items-center"
          onPress={() => refreshScore()}
          disabled={refreshing}
        >
          <Text className="text-white/80 font-bold">{refreshing ? "Refreshing Reputation..." : "Sync On-Chain Data"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 items-center"
          onPress={async () => {
             await logout();
             router.replace("/");
          }}
        >
          <Text className="text-red-400 font-bold">Disconnect Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Mock KYC Hub Modal */}
      {kycModalVisible && (
        <View className="absolute inset-0 z-50 bg-black/95 items-center justify-center px-6">
           <View className="glass rounded-3xl p-8 w-full max-w-sm border border-white/10">
              <Text className="text-2xl font-bold text-white mb-2">Identity Hub</Text>
              <Text className="text-white/40 text-sm mb-8">Link your identity to boost your FairScore by up to +150 points.</Text>
              
              <View className="space-y-4 mb-10">
                 <KYCOption icon="𝕏" label="Link X (Twitter)" status="CONNECTED" />
                 <KYCOption icon="💬" label="Link Discord" status="PENDING" />
                 <KYCOption icon="🪪" label="Government ID" status="REQUIRED" />
              </View>

              <TouchableOpacity 
                className={`w-full py-4 rounded-2xl items-center ${isVerifying ? 'bg-white/10' : 'bg-primary'}`}
                onPress={() => {
                  setIsVerifying(true);
                  setTimeout(() => {
                    refreshScore();
                    setIsVerifying(false);
                  }, 2000);
                }}
                disabled={isVerifying}
              >
                <Text className="text-white font-bold text-lg">{isVerifying ? "Verifying..." : "Refresh Identity Status"}</Text>
              </TouchableOpacity>

              <TouchableOpacity className="mt-4 items-center" onPress={() => setKycModalVisible(false)}>
                <Text className="text-white/30 text-sm">Cancel</Text>
              </TouchableOpacity>
           </View>
        </View>
      )}
    </ScrollView>
  );
}

function StatItem({ label, sub }: { label: string, sub: string }) {
  return (
    <View className="items-center flex-1">
      <Text className="text-white font-bold text-lg">{label}</Text>
      <Text className="text-white/30 text-[10px] uppercase font-bold tracking-tighter">{sub}</Text>
    </View>
  );
}

function PillarBox({ label, status, color, width }: { label: string, status: string, color: string, width: string }) {
  const getStatusColorClass = (s: string) => {
    if (s === "High") return "text-pillarHigh";
    if (s === "Medium") return "text-pillarMedium";
    return "text-pillarLow";
  };

  return (
    <View className={`${width} glass rounded-2xl p-4 h-24 justify-between`}>
      <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{label}</Text>
      <Text className={`text-base font-bold ${getStatusColorClass(status)}`}>{status}</Text>
    </View>
  );
}

function TimelineItem({ icon, title, sub, time }: any) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-white/5 last:border-0">
       <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center mr-3">
             <Text>{icon}</Text>
          </View>
          <View className="flex-1">
             <Text className="text-white text-sm font-bold">{title}</Text>
             <Text className="text-white/40 text-[10px]">{sub}</Text>
          </View>
       </View>
       <Text className="text-white/20 text-[8px] font-bold uppercase">{time}</Text>
    </View>
  );
}

function ActionItem({ title, sub, priority, onPress }: any) {
  const priorityColor = priority === "HIGH" ? "bg-red-500/10 text-red-500" : priority === "MEDIUM" ? "bg-yellow-500/10 text-yellow-500" : "bg-primary/10 text-primary";
  return (
    <TouchableOpacity onPress={onPress} className="glass rounded-2xl p-5 flex-row items-center justify-between">
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-white font-bold mr-2 text-sm">{title}</Text>
          <View className={`${priorityColor.split(' ')[0]} px-2 py-0.5 rounded-md`}>
            <Text className={`text-[8px] font-bold ${priorityColor.split(' ')[1]}`}>{priority}</Text>
          </View>
        </View>
        <Text className="text-white/40 text-[10px]">{sub}</Text>
      </View>
      <Text className="text-white/20 text-xl">›</Text>
    </TouchableOpacity>
  );
}

function PerkCard({ title, sub, icon }: any) {
  return (
    <View className="glass rounded-2xl p-5 w-40 mr-4">
      <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center mb-8">
        <Text className="text-xl">{icon}</Text>
      </View>
      <Text className="text-white/40 text-[10px] font-bold uppercase">{sub}</Text>
      <Text className="text-white font-bold text-lg">{title}</Text>
    </View>
  );
}

function KYCOption({ icon, label, status }: any) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-white/5">
       <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-white/5 items-center justify-center mr-3">
             <Text className="text-white font-bold text-sm">{icon}</Text>
          </View>
          <Text className="text-white font-medium text-sm">{label}</Text>
       </View>
       <Text className={`text-[10px] font-bold ${status === 'CONNECTED' ? 'text-green-500' : 'text-primary'}`}>{status}</Text>
    </View>
  );
}
