import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { useMutation } from "@apollo/client";
import { CREATE_OFFER_MUTATION } from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#07152B",
  accent: "#6366f1",
};

const CRYPTO_ASSETS = [
  { id: "USDC", name: "USD Coin", icon: "💵" },
  { id: "SOL", name: "Solana", icon: "◎" },
  { id: "USDT", name: "Tether", icon: "💲" },
];

const PAYMENT_METHODS = [
  { id: "BANK_TRANSFER", name: "Bank Transfer", icon: "🏦" },
  { id: "MOBILE_MONEY", name: "Mobile Money", icon: "📱" },
  { id: "PAYPAL", name: "PayPal", icon: "💳" },
];

export default function CreateOfferScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [createOffer, { loading }] = useMutation(CREATE_OFFER_MUTATION);

  const [formData, setFormData] = useState({
    cryptoAsset: "USDC",
    cryptoAmount: "",
    fiatCurrency: "USD",
    price: "",
    paymentMethod: "BANK_TRANSFER",
    minLimit: "",
    maxLimit: "",
  });

  const capabilities = user?.capabilities;
  const canCreateOffer = capabilities?.canSell;
  const maxTradeLimit = capabilities?.maxTradeAmount || 500;

  // Form is valid if amount and price are filled
  const isFormValid = !!(formData.cryptoAmount && formData.price && parseFloat(formData.cryptoAmount) > 0 && parseFloat(formData.price) > 0);

  const totalReceive =
    parseFloat(formData.cryptoAmount || "0") *
    parseFloat(formData.price || "0");

  const handleSubmit = async () => {
    if (!formData.cryptoAmount || !formData.price) {
      Alert.alert("Missing Info", "Please fill in amount and price");
      return;
    }

    // Demo mode for users without sell capability
    if (!canCreateOffer) {
      Alert.alert(
        "Demo Mode", 
        `This would create an offer to sell ${formData.cryptoAmount} ${formData.cryptoAsset} for $${totalReceive.toFixed(2)}.\n\nUpgrade to Bronze tier (FairScore 300+) to create real offers.`,
        [{ text: "OK", onPress: () => router.push("/(tabs)") }]
      );
      return;
    }

    try {
      await createOffer({
        variables: {
          input: {
            cryptoAsset: formData.cryptoAsset,
            cryptoAmount: parseFloat(formData.cryptoAmount),
            fiatCurrency: formData.fiatCurrency,
            fiatAmount: totalReceive,
            paymentMethod: formData.paymentMethod,
            paymentDetails: { type: formData.paymentMethod },
            minLimit: parseFloat(formData.minLimit) || 10,
            maxLimit: parseFloat(formData.maxLimit) || maxTradeLimit,
          },
        },
      });
      Alert.alert("Success", "Offer created successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)") }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create offer");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 border-b border-white/5">
          <AppText variant="h3" weight="bold" className="text-white mb-1">Create Offer</AppText>
          <AppText variant="caption" className="text-white/40">
            {canCreateOffer 
              ? `Your tier allows max $${maxTradeLimit.toLocaleString()}/trade`
              : "⚠️ Bronze tier required to sell"
            }
          </AppText>
        </View>

        <KeyboardAwareScrollView 
          className="flex-1 px-5" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
          enableOnAndroid={true}
          extraScrollHeight={100}
        >
          {/* Cannot Create Warning */}
          {!canCreateOffer && (
            <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-4 flex-row items-center">
              <AppText className="text-2xl mr-3">🔒</AppText>
              <View className="flex-1">
                <AppText weight="bold" className="text-yellow-400">Upgrade to Bronze</AppText>
                <AppText variant="caption" className="text-yellow-400/70">
                  Increase your FairScore to 300+ to create offers
                </AppText>
              </View>
            </View>
          )}

          {/* Asset Selection */}
          <View className="mt-4">
            <AppText variant="label" className="text-white/40 mb-3">I want to sell</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CRYPTO_ASSETS.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  className={`mr-3 px-5 py-4 rounded-xl flex-row items-center ${
                    formData.cryptoAsset === asset.id 
                      ? "bg-indigo-500" 
                      : "bg-white/5 border border-white/10"
                  }`}
                  onPress={() => setFormData({ ...formData, cryptoAsset: asset.id })}
                >
                  <AppText className="text-xl mr-2">{asset.icon}</AppText>
                  <AppText weight="bold" className={`${
                    formData.cryptoAsset === asset.id ? "text-white" : "text-white/60"
                  }`}>
                    {asset.id}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Amount */}
          <View className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <AppText variant="label" className="text-white/40 mb-3">Amount</AppText>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 text-4xl font-bold text-white"
                style={{ fontFamily: "Outfit_700Bold" }}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="decimal-pad"
                value={formData.cryptoAmount}
                onChangeText={(text) => setFormData({ ...formData, cryptoAmount: text })}
              />
              <AppText weight="medium" className="text-white/40 text-xl ml-2">{formData.cryptoAsset}</AppText>
            </View>
          </View>

          {/* Price */}
          <View className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <AppText variant="label" className="text-white/40 mb-3">
              Price per {formData.cryptoAsset}
            </AppText>
            <View className="flex-row items-center">
              <AppText weight="medium" className="text-white/40 text-xl mr-2">$</AppText>
              <TextInput
                className="flex-1 text-4xl font-bold text-white"
                style={{ fontFamily: "Outfit_700Bold" }}
                placeholder="1.00"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
              />
              <AppText weight="medium" className="text-white/40 text-xl ml-2">USD</AppText>
            </View>
          </View>

          {/* Total Preview */}
          {totalReceive > 0 && (
            <View className="mt-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
              <AppText variant="label" className="text-green-400/70 mb-1">You'll receive</AppText>
              <AppText weight="bold" className="text-green-400 text-3xl">${totalReceive.toFixed(2)}</AppText>
            </View>
          )}

          {/* Payment Method */}
          <View className="mt-6">
            <AppText variant="label" className="text-white/40 mb-3">Payment Method</AppText>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                className={`mb-2 p-4 rounded-xl flex-row items-center ${
                  formData.paymentMethod === method.id 
                    ? "bg-indigo-500/20 border border-indigo-500/50" 
                    : "bg-white/5 border border-white/10"
                }`}
                onPress={() => setFormData({ ...formData, paymentMethod: method.id })}
              >
                <AppText className="text-xl mr-3">{method.icon}</AppText>
                <AppText weight="bold" className={`flex-1 ${
                  formData.paymentMethod === method.id ? "text-white" : "text-white/60"
                }`}>
                  {method.name}
                </AppText>
                {formData.paymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Trade Limits */}
          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
              <AppText variant="label" className="text-white/40 mb-2">Min Trade</AppText>
              <TextInput
                className="text-white text-lg font-bold"
                style={{ fontFamily: "Outfit_700Bold" }}
                placeholder="$10"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
                value={formData.minLimit}
                onChangeText={(text) => setFormData({ ...formData, minLimit: text })}
              />
            </View>
            <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
              <AppText variant="label" className="text-white/40 mb-2">Max Trade</AppText>
              <TextInput
                className="text-white text-lg font-bold"
                style={{ fontFamily: "Outfit_700Bold" }}
                placeholder={`$${maxTradeLimit}`}
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
                value={formData.maxLimit}
                onChangeText={(text) => setFormData({ ...formData, maxLimit: text })}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="mt-8 mb-6"
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            <LinearGradient
              colors={isFormValid ? ["#22c55e", "#16a34a"] : ["#4b5563", "#374151"]}
              className="py-5 rounded-2xl items-center flex-row justify-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : null}
              <AppText weight="bold" className="text-white text-lg">
                {loading ? "Creating..." : canCreateOffer ? "Create Offer" : "Create Offer (Demo)"}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
