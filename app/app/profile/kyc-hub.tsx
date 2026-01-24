import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

interface SocialLink {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  username?: string;
  scoreBoost: number;
  unlocks: string;
}

export default function KYCHubScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const [socials, setSocials] = useState<SocialLink[]>([
    {
      id: "twitter",
      name: "Twitter/X",
      icon: "logo-twitter",
      color: "#1DA1F2",
      connected: false,
      scoreBoost: 15,
      unlocks: "+$2,000 limit",
    },
    {
      id: "discord",
      name: "Discord",
      icon: "logo-discord",
      color: "#5865F2",
      connected: false,
      scoreBoost: 10,
      unlocks: "Community badge",
    },
    {
      id: "github",
      name: "GitHub",
      icon: "logo-github",
      color: "#ffffff",
      connected: false,
      scoreBoost: 20,
      unlocks: "Builder badge",
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: "paper-plane",
      color: "#0088cc",
      connected: false,
      scoreBoost: 10,
      unlocks: "Fast support",
    },
  ]);

  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const handleConnect = async (social: SocialLink) => {
    setIsVerifying(social.id);
    
    // Simulate OAuth flow
    setTimeout(() => {
      setSocials(prev => prev.map(s => 
        s.id === social.id 
          ? { ...s, connected: true, username: `@demo_user` }
          : s
      ));
      setIsVerifying(null);
      Alert.alert(
        "Connected! ✓",
        `Your ${social.name} account has been linked. You earned +${social.scoreBoost} to your social score!`
      );
    }, 2000);
  };

  const handleDisconnect = (social: SocialLink) => {
    Alert.alert(
      "Disconnect Account",
      `Remove ${social.name} from your profile? This will reduce your social score.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            setSocials(prev => prev.map(s =>
              s.id === social.id
                ? { ...s, connected: false, username: undefined }
                : s
            ));
          },
        },
      ]
    );
  };

  const connectedCount = socials.filter(s => s.connected).length;
  const totalBoost = socials.filter(s => s.connected).reduce((acc, s) => acc + s.scoreBoost, 0);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">KYC Hub 🔐</Text>
            <Text className="text-white/40 text-xs">Link socials to boost your trust</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            className="rounded-2xl p-5 mt-5"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">
                  Verification Status
                </Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {connectedCount}/4 Linked
                </Text>
              </View>
              <View className="bg-white/20 rounded-full px-4 py-2">
                <Text className="text-white font-bold">+{totalBoost} pts</Text>
              </View>
            </View>
            
            <View className="flex-row mt-4 gap-1">
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < connectedCount ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </View>
          </LinearGradient>

          {/* Why Link Section */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-5">
            <Text className="text-white font-bold text-lg mb-3">Why Link Accounts?</Text>
            <View className="space-y-3">
              <BenefitItem 
                icon="shield-checkmark" 
                text="Unlock trades over $5,000" 
                color="#10b981"
              />
              <BenefitItem 
                icon="trending-up" 
                text="Boost your FairScale social score" 
                color="#6366f1"
              />
              <BenefitItem 
                icon="people" 
                text="Build trust with counterparties" 
                color="#8b5cf6"
              />
              <BenefitItem 
                icon="ribbon" 
                text="Earn exclusive badges" 
                color="#f59e0b"
              />
            </View>
          </View>

          {/* Social Accounts */}
          <Text className="text-white font-bold text-lg mt-6 mb-3">Link Your Accounts</Text>
          
          {socials.map((social) => (
            <View
              key={social.id}
              className={`mb-3 rounded-2xl p-4 border ${
                social.connected 
                  ? "border-green-500/30 bg-green-500/10" 
                  : "border-white/10 bg-white/5"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${social.color}20` }}
                  >
                    <Ionicons 
                      name={social.icon as any} 
                      size={24} 
                      color={social.color} 
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold">{social.name}</Text>
                      {social.connected && (
                        <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full">
                          <Text className="text-green-400 text-xs">✓ Linked</Text>
                        </View>
                      )}
                    </View>
                    {social.connected ? (
                      <Text className="text-green-400 text-xs">{social.username}</Text>
                    ) : (
                      <Text className="text-white/40 text-xs">
                        +{social.scoreBoost} pts • {social.unlocks}
                      </Text>
                    )}
                  </View>
                </View>
                
                {social.connected ? (
                  <TouchableOpacity 
                    onPress={() => handleDisconnect(social)}
                    className="bg-white/10 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white/60 font-bold text-sm">Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleConnect(social)}
                    disabled={isVerifying === social.id}
                    className="bg-indigo-500 px-4 py-2 rounded-xl"
                    style={{ opacity: isVerifying === social.id ? 0.5 : 1 }}
                  >
                    <Text className="text-white font-bold text-sm">
                      {isVerifying === social.id ? "Linking..." : "Connect"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* ID Verification Section */}
          <View className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-5 mt-5 mb-8">
            <View className="flex-row items-center mb-3">
              <Text className="text-3xl mr-3">🪪</Text>
              <View>
                <Text className="text-white font-bold text-lg">Full ID Verification</Text>
                <Text className="text-white/50 text-xs">For institutional limits</Text>
              </View>
            </View>
            <Text className="text-white/70 text-sm leading-5 mb-4">
              Complete full KYC verification to unlock unlimited trading and become a verified merchant on the platform.
            </Text>
            <TouchableOpacity className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl py-3 items-center">
              <Text className="text-yellow-400 font-bold">Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function BenefitItem({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View className="flex-row items-center">
      <View 
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text className="text-white/70 flex-1">{text}</Text>
    </View>
  );
}
