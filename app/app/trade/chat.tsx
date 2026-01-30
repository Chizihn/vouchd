import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TRADE_QUERY } from "@/graphql/queries";
import { SEND_MESSAGE_MUTATION } from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { getTimeAgo } from "@/utils/helpers";
import { TierBadge } from "@/components/TierBadge";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

export default function TradeChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = useAuthStore((state: any) => state.user);
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const { data, loading, refetch } = useQuery(GET_TRADE_QUERY, {
    variables: { id },
    pollInterval: 3000,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: () => {
      setMessage("");
      refetch();
    },
  });

  const trade = data?.trade;
  const messages = trade?.messages || [];
  const counterparty = user?.id === trade?.buyer?.id ? trade?.seller : trade?.buyer;

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage({
      variables: {
        tradeId: id,
        content: message.trim(),
        messageType: "TEXT",
      },
    });
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (loading && !trade) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.background }} className="items-center justify-center">
        <AppText className="text-white/50">Loading chat...</AppText>
      </View>
    );
  }

  if (!trade || !user) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: THEME.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="pb-4 px-5 border-b border-white/5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 items-center justify-center mr-3">
                <AppText weight="bold" className="text-indigo-400">
                  {counterparty?.username?.[0]?.toUpperCase() || "?"}
                </AppText>
              </View>
              <View>
                <AppText weight="bold" className="text-lg text-white">
                  {counterparty?.username || "Anonymous"}
                </AppText>
                <TierBadge
                  tier={counterparty?.fairTier}
                  score={counterparty?.fairScore}
                  starRating={counterparty?.starRating}
                  size="xs"
                />
              </View>
            </View>
            <TouchableOpacity 
              className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
              onPress={() => router.push(`/trade/${id}` as any)}
            >
              <AppText variant="label" weight="semibold" className="text-white/60">Details</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Safety Warning */}
          <View className="items-center mb-6">
            <View className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl">
              <AppText variant="caption" className="text-yellow-500/80 text-center">
                ⚠️ Safety First: Never share your password or click suspicious links.
                Always confirm payment in your bank app.
              </AppText>
            </View>
          </View>

          {messages.map((msg: any) => {
            const isMe = msg.senderId === user.id;
            return (
              <View
                key={msg.id}
                className={`mb-4 flex-row ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <View className="w-8 h-8 rounded-full bg-white/10 mr-2 items-center justify-center">
                    <AppText variant="caption" className="text-white/60">{counterparty?.username?.[0]}</AppText>
                  </View>
                )}
                <View
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isMe 
                      ? "bg-indigo-500 rounded-tr-none" 
                      : "bg-white/10 border border-white/10 rounded-tl-none"
                  }`}
                >
                  <AppText className={`${isMe ? "text-white" : "text-white/80"}`}>
                    {msg.content}
                  </AppText>
                  <AppText
                    variant="caption"
                    className={`mt-1 ${
                      isMe ? "text-indigo-200 text-right" : "text-white/30"
                    }`}
                  >
                    {getTimeAgo(msg.createdAt)}
                  </AppText>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 pb-6 border-t border-white/5 flex-row items-center" style={{ backgroundColor: THEME.background }}>
          <TouchableOpacity className="w-10 h-10 items-center justify-center mr-2 bg-white/10 rounded-full">
            <Ionicons name="add" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          <View className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
            <TextInput
              className="text-white max-h-32"
              style={{ fontFamily: 'Outfit_400Regular' }}
              placeholder="Type message..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity
            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
              message.trim() ? "bg-indigo-500" : "bg-white/10"
            }`}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons 
              name="arrow-up" 
              size={20} 
              color={message.trim() ? "white" : "rgba(255,255,255,0.3)"} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
