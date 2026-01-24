import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
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
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Create Sell Offer
          </Text>
          {user && (
            <TierBadge
              tier={user.fairTier}
              score={user.fairScore}
              size="sm"
              showScore={false}
            />
          )}
        </View>
        <Text className="text-sm text-gray-500 text-center">
          Your limits: ${maxTradeLimit.toLocaleString()}/trade
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Asset Selection */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-gray-600 text-sm mb-2">I want to sell</Text>

          <TouchableOpacity className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-500 rounded-full mr-3" />
              <Text className="text-lg font-semibold text-gray-900">
                {formData.cryptoAsset}
              </Text>
            </View>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>

          <TextInput
            className="text-3xl font-bold text-gray-900 mb-2"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={formData.cryptoAmount}
            onChangeText={(text) =>
              setFormData({ ...formData, cryptoAmount: text })
            }
          />
          <Text className="text-sm text-gray-500">Available: 1,450 USDC</Text>
          <Text className="text-sm text-gray-400 mt-1">
            ≈ ${formData.cryptoAmount || "0.00"} USD
          </Text>
        </View>

        {/* Pricing */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-gray-600 text-sm mb-4">
            Price per {formData.cryptoAsset}
          </Text>

          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 text-2xl font-bold text-gray-900 mr-2"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />
            <Text className="text-gray-500 text-lg">
              {formData.fiatCurrency}
            </Text>
          </View>

          <Text className="text-sm text-gray-500 mb-1">
            Market rate: ${marketRate.toFixed(2)}
          </Text>
          {priceVsMarket !== 0 && (
            <Text
              className={`text-sm font-medium ${priceVsMarket > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {priceVsMarket > 0 ? "+" : ""}
              {priceVsMarket.toFixed(2)}% vs market
            </Text>
          )}

          <View className="bg-blue-50 rounded-lg p-4 mt-4">
            <Text className="text-sm text-gray-600 mb-1">
              Total you'll receive
            </Text>
            <Text className="text-3xl font-bold text-gray-900">
              ${totalReceive.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-gray-600 text-sm mb-4">Payment Method</Text>

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
              <Text className="font-semibold text-gray-900">Bank Transfer</Text>
              <Text className="text-xs text-green-600">Recommended</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-lg bg-gray-100 opacity-50"
            disabled
          >
            <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3" />
            <View className="flex-1">
              <Text className="font-semibold text-gray-500">Cash Meetup</Text>
              <Text className="text-xs text-gray-400">
                Requires Gold tier 🔒
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Trade Limits */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-600 text-sm">Trade Limits</Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 mr-1">🔒</Text>
              <Text className="text-xs text-gray-500">Based on FairScore</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-600 text-sm mb-2">Minimum trade</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-lg text-gray-900"
              placeholder="50"
              keyboardType="decimal-pad"
              value={formData.minLimit}
              onChangeText={(text) =>
                setFormData({ ...formData, minLimit: text })
              }
            />
          </View>

          <View>
            <Text className="text-gray-600 text-sm mb-2">Maximum trade</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-lg text-gray-900"
              placeholder={maxTradeLimit.toString()}
              keyboardType="decimal-pad"
              value={formData.maxLimit}
              onChangeText={(text) =>
                setFormData({ ...formData, maxLimit: text })
              }
            />
            <Text className="text-xs text-gray-500 mt-1">
              Your {user?.fairTier} tier allows max $
              {maxTradeLimit.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Additional Settings */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-gray-600 text-sm mb-4">
            Additional Settings
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-900 font-medium">Trading window</Text>
              <Text className="text-sm text-gray-500">2 hours</Text>
            </View>
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
              <Text className="text-gray-700">Change</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-900 font-medium">
                Auto-accept trades
              </Text>
              <Text className="text-sm text-gray-500">
                Automatically accept matching orders
              </Text>
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
            <Text className="text-yellow-800 font-medium mb-2">
              ⚠️ Tier Limitation
            </Text>
            <Text className="text-yellow-700 text-sm mb-2">
              Your Silver tier allows max ${maxTradeLimit.toLocaleString()}{" "}
              trades
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/profile/boost-score")}
            >
              <Text className="text-yellow-900 text-sm font-medium underline">
                Upgrade to Gold for higher limits →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Button */}
        <TouchableOpacity
          className={`rounded-full py-4 mb-8 ${canCreateOffer ? "bg-green-500" : "bg-gray-300"}`}
          onPress={handleSubmit}
          disabled={!canCreateOffer || loading}
        >
          <Text className="text-white font-bold text-center text-lg">
            {loading ? "Creating..." : "Create Offer"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
