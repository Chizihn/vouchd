import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useRouter } from "expo-router";
import { useMutation } from "@apollo/client";
import { CREATE_OFFER_MUTATION } from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { TierBadge } from "@/components/TierBadge";

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
    autoAccept: false,
  });

  const capabilities = user?.capabilities;
  const marketRate = 1.0; // Mock market rate

  const totalReceive =
    parseFloat(formData.cryptoAmount || "0") *
    parseFloat(formData.price || "0");
  const priceVsMarket =
    ((parseFloat(formData.price || "0") - marketRate) / marketRate) * 100;

  const canCreateOffer = capabilities?.canSell;
  const maxTradeLimit = capabilities?.maxTradeAmount || 0;

  const handleSubmit = async () => {
    if (!canCreateOffer) {
      alert("You need Bronze tier or higher to create offers");
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
            paymentDetails: { bankName: "GTBank", accountNumber: "0123456789" },
            minLimit: parseFloat(formData.minLimit),
            maxLimit: parseFloat(formData.maxLimit),
          },
        },
      });
      router.back();
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <AppText className="text-2xl">←</AppText>
          </TouchableOpacity>
          <AppText weight="bold" className="text-xl text-gray-900">
            Create Sell Offer
          </AppText>
          {user && (
            <TierBadge
              tier={user.fairTier}
              score={user.fairScore}
              size="sm"
              showScore={false}
            />
          )}
        </View>
        <AppText className="text-sm text-gray-500 text-center">
          Your limits: ${maxTradeLimit.toLocaleString()}/trade
        </AppText>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Asset Selection */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <AppText className="text-gray-600 text-sm mb-2">I want to sell</AppText>

          <TouchableOpacity className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-500 rounded-full mr-3" />
              <AppText weight="bold" className="text-lg text-gray-900">
                {formData.cryptoAsset}
              </AppText>
            </View>
            <AppText className="text-gray-400">▼</AppText>
          </TouchableOpacity>

          <TextInput
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Outfit_700Bold" }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={formData.cryptoAmount}
            onChangeText={(text) =>
              setFormData({ ...formData, cryptoAmount: text })
            }
          />
          <AppText variant="caption" className="text-gray-500">Available: 1,450 USDC</AppText>
          <AppText variant="caption" className="text-gray-400 mt-1">
            ≈ ${formData.cryptoAmount || "0.00"} USD
          </AppText>
        </View>

        {/* Pricing */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <AppText className="text-gray-600 text-sm mb-4">
            Price per {formData.cryptoAsset}
          </AppText>

          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 text-2xl font-bold text-gray-900 mr-2"
              style={{ fontFamily: "Outfit_700Bold" }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />
            <AppText weight="medium" className="text-gray-500 text-lg">
              {formData.fiatCurrency}
            </AppText>
          </View>

          <AppText variant="caption" className="text-gray-500 mb-1">
            Market rate: ${marketRate.toFixed(2)}
          </AppText>
          {priceVsMarket !== 0 && (
            <AppText
              variant="caption"
              weight="medium"
              className={`${priceVsMarket > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {priceVsMarket > 0 ? "+" : ""}
              {priceVsMarket.toFixed(2)}% vs market
            </AppText>
          )}

          <View className="bg-blue-50 rounded-lg p-4 mt-4">
            <AppText variant="caption" className="text-gray-600 mb-1">
              Total you'll receive
            </AppText>
            <AppText weight="bold" className="text-3xl text-gray-900">
              ${totalReceive.toFixed(2)}
            </AppText>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <AppText className="text-gray-600 text-sm mb-4">Payment Method</AppText>

          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-lg mb-2 ${
              formData.paymentMethod === "BANK_TRANSFER"
                ? "bg-blue-50 border-2 border-blue-500"
                : "bg-gray-50"
            }`}
            onPress={() =>
              setFormData({ ...formData, paymentMethod: "BANK_TRANSFER" })
            }
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                formData.paymentMethod === "BANK_TRANSFER"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            >
              {formData.paymentMethod === "BANK_TRANSFER" && (
                <View className="w-2 h-2 bg-white rounded-full m-auto" />
              )}
            </View>
            <View className="flex-1">
              <AppText weight="semibold" className="text-gray-900">Bank Transfer</AppText>
              <AppText variant="caption" className="text-green-600">Recommended</AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-lg bg-gray-100 opacity-50"
            disabled
          >
            <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3" />
            <View className="flex-1">
              <AppText weight="semibold" className="text-gray-500">Cash Meetup</AppText>
              <AppText variant="caption" className="text-gray-400">
                Requires Gold tier 🔒
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Trade Limits */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <AppText className="text-gray-600 text-sm">Trade Limits</AppText>
            <View className="flex-row items-center">
              <AppText variant="caption" className="text-gray-500 mr-1">🔒</AppText>
              <AppText variant="caption" className="text-gray-500">Based on FairScore</AppText>
            </View>
          </View>

          <View className="mb-4">
            <AppText className="text-gray-600 text-sm mb-2">Minimum trade</AppText>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-lg text-gray-900 font-bold"
              style={{ fontFamily: "Outfit_700Bold" }}
              placeholder="50"
              keyboardType="decimal-pad"
              value={formData.minLimit}
              onChangeText={(text) =>
                setFormData({ ...formData, minLimit: text })
              }
            />
          </View>

          <View>
            <AppText className="text-gray-600 text-sm mb-2">Maximum trade</AppText>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-lg text-gray-900 font-bold"
              style={{ fontFamily: "Outfit_700Bold" }}
              placeholder={maxTradeLimit.toString()}
              keyboardType="decimal-pad"
              value={formData.maxLimit}
              onChangeText={(text) =>
                setFormData({ ...formData, maxLimit: text })
              }
            />
            <AppText variant="caption" className="text-gray-500 mt-1">
              Your {user?.fairTier} tier allows max $
              {maxTradeLimit.toLocaleString()}
            </AppText>
          </View>
        </View>

        {/* Additional Settings */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <AppText className="text-gray-600 text-sm mb-4">
            Additional Settings
          </AppText>

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <AppText weight="medium" className="text-gray-900">Trading window</AppText>
              <AppText variant="caption" className="text-gray-500">2 hours</AppText>
            </View>
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
              <AppText className="text-gray-700">Change</AppText>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <AppText weight="medium" className="text-gray-900">
                Auto-accept trades
              </AppText>
              <AppText variant="caption" className="text-gray-500">
                Automatically accept matching orders
              </AppText>
            </View>
            <Switch
              value={formData.autoAccept}
              onValueChange={(value) =>
                setFormData({ ...formData, autoAccept: value })
              }
            />
          </View>
        </View>

        {/* Warning Card for Low Tier */}
        {user?.fairTier === "SILVER" && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
            <AppText weight="medium" className="text-yellow-800 mb-2">
              ⚠️ Tier Limitation
            </AppText>
            <AppText variant="caption" className="text-yellow-700 mb-2">
              Your Silver tier allows max ${maxTradeLimit.toLocaleString()}{" "}
              trades
            </AppText>
            <TouchableOpacity
              onPress={() => router.push("/profile/boost-score")}
            >
              <AppText variant="caption" weight="medium" className="text-yellow-900 underline">
                Upgrade to Gold for higher limits →
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Button */}
        <TouchableOpacity
          className={`rounded-full py-4 mb-8 ${canCreateOffer ? "bg-green-500" : "bg-gray-300"}`}
          onPress={handleSubmit}
          disabled={!canCreateOffer || loading}
        >
          <AppText weight="bold" className="text-white text-center text-lg">
            {loading ? "Creating..." : "Create Offer"}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
