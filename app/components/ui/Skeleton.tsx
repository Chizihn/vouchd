import React from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ 
  width = "100%", 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "rgba(255,255,255,0.05)",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.08)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonCard({ style }: { style?: any }) {
  return (
    <View 
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
      style={style}
    >
      <View className="flex-row items-center mb-4">
        <Skeleton width={48} height={48} borderRadius={24} />
        <View className="ml-3 flex-1">
          <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 12 }} />
      <View className="flex-row justify-between">
        <Skeleton width="30%" height={32} borderRadius={16} />
        <Skeleton width="30%" height={32} borderRadius={16} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export function SkeletonProfileHeader() {
  return (
    <View className="items-center p-6">
      <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
      <Skeleton width={120} height={20} style={{ marginBottom: 8 }} />
      <Skeleton width={180} height={14} style={{ marginBottom: 16 }} />
      <View className="flex-row gap-4 w-full justify-center">
        <Skeleton width={80} height={60} borderRadius={12} />
        <Skeleton width={80} height={60} borderRadius={12} />
        <Skeleton width={80} height={60} borderRadius={12} />
      </View>
    </View>
  );
}
