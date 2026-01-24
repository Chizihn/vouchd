import React, { useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth";

const { width } = Dimensions.get("window");

const ONBOARDING_PAGES = [
  {
    title: "Trust-Verified Trading",
    subtitle: "Every trader has a FairScore based on their on-chain history, transaction patterns, and community reputation.",
    icon: "🛡️",
    accentColor: "#22c55e",
  },
  {
    title: "Secure Escrow",
    subtitle: "Smart contracts hold funds until both parties confirm. No middleman, no risk of fraud.",
    icon: "🔐",
    accentColor: "#3b82f6",
  },
  {
    title: "Earn As You Grow",
    subtitle: "Higher reputation tiers unlock lower fees, bigger limits, and exclusive rewards.",
    icon: "💎",
    accentColor: "#a855f7",
  },
];

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleScroll = (event: any) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  return (
    <LinearGradient
      colors={["#07152B", "#0a1929", "#07152B"]}
      className="flex-1"
    >
      {/* Decorative Blurs */}
      <View className="absolute top-32 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      <View className="absolute top-[40%] right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      
      {/* Header */}
      <View className="pt-16 px-6 flex-row justify-between items-center">
        <Text className="text-2xl font-black text-white">Vouchd</Text>
        <Link href="/auth/connect-wallet" asChild>
          <TouchableOpacity className="bg-white/10 border border-white/20 px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-semibold">Skip</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {ONBOARDING_PAGES.map((page, index) => (
          <View key={index} style={{ width }} className="flex-1 items-center justify-center px-8">
            {/* Icon Container */}
            <View 
              className="w-40 h-40 rounded-[40px] items-center justify-center mb-10 border-2"
              style={{ 
                backgroundColor: `${page.accentColor}15`,
                borderColor: `${page.accentColor}40`,
                shadowColor: page.accentColor,
                shadowRadius: 40,
                shadowOpacity: 0.3,
              }}
            >
              <Text className="text-7xl">{page.icon}</Text>
            </View>

            {/* Content */}
            <Text className="text-3xl font-bold text-white text-center mb-4">
              {page.title}
            </Text>
            <Text className="text-white/50 text-center text-lg leading-7 px-4">
              {page.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-8">
        {ONBOARDING_PAGES.map((_, index) => (
          <View
            key={index}
            className={`mx-1.5 rounded-full transition-all ${
              currentPage === index 
                ? "w-8 h-2 bg-white" 
                : "w-2 h-2 bg-white/20"
            }`}
          />
        ))}
      </View>

      {/* Bottom Actions */}
      <View className="px-6 pb-10">
        <Link href="/auth/connect-wallet" asChild>
          <TouchableOpacity className="w-full mb-4">
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-5 items-center"
              style={{ shadowColor: '#6366f1', shadowRadius: 20, shadowOpacity: 0.5 }}
            >
              <Text className="text-white font-bold text-lg">Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>

        <View className="flex-row justify-center items-center">
          <Text className="text-white/30 text-sm">Already have a wallet? </Text>
          <Link href="/auth/connect-wallet" asChild>
            <TouchableOpacity>
              <Text className="text-blue-400 text-sm font-semibold">Connect Now</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}
