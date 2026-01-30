import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TRADE_QUERY } from "@/graphql/queries";
import { 
  MARK_FIAT_SENT_MUTATION, 
  CONFIRM_FIAT_RECEIVED_MUTATION, 
  RELEASE_CRYPTO_MUTATION,
  CONFIRM_ESCROW_MUTATION
} from "@/graphql/mutations";
import { useAuthStore } from "@/store/auth";
import { TierBadge } from "@/components/TierBadge";
import { useSolana } from "@/providers/SolanaWalletProvider";
import {
  formatCurrency,
  formatCrypto,
  getTimeRemaining,
} from "@/utils/helpers";
import { PillarAnalysis } from "@/components/PillarAnalysis";
import { EscrowClient } from "@/utils/escrow";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getConnection, SOLANA_CONFIG, getExplorerUrl } from "@/utils/solana";

export default function TradeEscrowScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = useAuthStore((state: any) => state.user);
  const { signTransaction } = useSolana();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showRepAnalysis, setShowRepAnalysis] = useState(false);

  const { data, loading, refetch } = useQuery(GET_TRADE_QUERY, {
    variables: { id },
    pollInterval: 5000,
  });

  const [markSent] = useMutation(MARK_FIAT_SENT_MUTATION, {
    variables: { tradeId: id },
    onCompleted: () => refetch(),
  });

  const [confirmEscrow] = useMutation(CONFIRM_ESCROW_MUTATION, {
    onCompleted: () => refetch(),
  });

  const [confirmReceived] = useMutation(CONFIRM_FIAT_RECEIVED_MUTATION, {
    variables: { tradeId: id },
    onCompleted: () => refetch(),
  });

  const [releaseCrypto] = useMutation(RELEASE_CRYPTO_MUTATION, {
    onCompleted: () => {
      refetch();
      router.push(`/trade/complete?id=${id}`);
    },
  });

  const trade = data?.trade;

  useEffect(() => {
    if (trade?.expiresAt) {
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(trade.expiresAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [trade?.expiresAt]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#07152B' }}>
        <AppText className="text-white/50">Loading trade...</AppText>
      </View>
    );
  }

  if (!trade || !user) return null;

  const isBuyer = user.id === trade.buyer.id;
  const isSeller = user.id === trade.seller.id;
  const counterparty = isBuyer ? trade.seller : trade.buyer;
  
  const isPending = trade.status === "PENDING";
  const isEscrowed = trade.status === "ESCROWED";
  const isFiatSent = trade.status === "FIAT_SENT";
  const isCompleted = trade.status === "COMPLETED";

  const handleRelease = async () => {
    if (!trade.releaseSignature && isSeller) {
      try {
        const connection = getConnection();
        const sellerPubKey = new PublicKey(user.walletAddress);
        const buyerPubKey = new PublicKey(trade.buyer.walletAddress);
        const mintPubKey = SOLANA_CONFIG.USDC_MINT;

        const releaseIx = EscrowClient.createReleaseInstruction(
          sellerPubKey,
          buyerPubKey,
          mintPubKey,
          trade.id
        );

        const transaction = new Transaction().add(releaseIx);
        transaction.feePayer = sellerPubKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signature = await signTransaction(transaction);
        
        if (signature) {
          await releaseCrypto({ 
            variables: { 
              tradeId: id, 
              signature: signature 
            } 
          });
        }
      } catch (error) {
        console.error("Manual release error:", error);
      }
    }
  };

  const handleDeposit = async () => {
    if (isPending && isSeller) {
      try {
        const connection = getConnection();
        const sellerPubKey = new PublicKey(user.walletAddress);
        const buyerPubKey = new PublicKey(trade.buyer.walletAddress);
        const mintPubKey = SOLANA_CONFIG.USDC_MINT;
        
        const [sellerTokenAccount] = EscrowClient.getAta(sellerPubKey, mintPubKey);

        // Convert cryptoAmount to base units (e.g., 6 decimals for USDC)
        const amount = Math.floor(trade.cryptoAmount * 1_000_000);

        const depositIx = EscrowClient.createCreateEscrowInstruction(
          sellerPubKey,
          buyerPubKey,
          sellerTokenAccount,
          mintPubKey,
          trade.id,
          amount
        );

        const transaction = new Transaction().add(depositIx);
        transaction.feePayer = sellerPubKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signature = await signTransaction(transaction);
        
        if (signature) {
          await confirmEscrow({ 
            variables: { 
              tradeId: id, 
              signature: signature 
            } 
          });
        }
      } catch (error) {
        console.error("Manual deposit error:", error);
      }
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#07152B' }}>
      {/* Reputation Analysis Modal */}
      {showRepAnalysis && (
        <View className="absolute inset-0 z-50 bg-black/80 items-center justify-center px-6">
          <View className="glass rounded-3xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-6">
              <AppText variant="h3" weight="bold" className="text-white">Trust Intelligence</AppText>
              <TouchableOpacity onPress={() => setShowRepAnalysis(false)}>
                <AppText className="text-white/40 text-xl">✕</AppText>
              </TouchableOpacity>
            </View>

            <View className="mt-2">
              <PillarAnalysis pillars={counterparty.pillars} />
            </View>

            <View className="mt-8 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
               <AppText variant="label" weight="extrabold" className="text-blue-400 mb-1">💡 Safety Insight</AppText>
               <AppText className="text-white/80 text-[11px] leading-relaxed">
                 {counterparty.safetyInsight || "🛡️ Standard reputation profile. Follow normal P2P safety procedures."}
               </AppText>
            </View>

            <TouchableOpacity 
              className="mt-6 bg-blue-600 rounded-2xl py-4 items-center"
              onPress={() => setShowRepAnalysis(false)}
            >
              <AppText weight="bold" className="text-white">Back to Trade</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View className="pt-12 pb-4 px-6 border-b border-white/5" style={{ backgroundColor: '#07152B' }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <AppText className="text-2xl text-white">←</AppText>
        </TouchableOpacity>
        <View className="flex-row items-center justify-between">
          <AppText weight="semibold" className="text-lg text-white">
            Trade #{trade.id.slice(0, 8)}
          </AppText>
        </View>
      </View>

      {/* Status Banner */}
      <View
        className={`px-6 py-3 ${
          trade.status === "PENDING"
            ? "bg-yellow-500/10"
            : trade.status === "ESCROWED"
              ? "bg-blue-500/10"
              : trade.status === "FIAT_SENT"
                ? "bg-purple-500/10"
                : "bg-green-500/10"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <AppText
            weight="bold"
            className={`uppercase tracking-widest text-[10px] ${
              trade.status === "PENDING"
                ? "text-yellow-500"
                : trade.status === "ESCROWED"
                  ? "text-blue-500"
                  : trade.status === "FIAT_SENT"
                    ? "text-purple-500"
                    : "text-green-500"
            }`}
          >
            {trade.status === "PENDING"
              ? "⏳ Waiting for Escrow"
              : trade.status === "ESCROWED"
                ? "🔒 Funds Locked in Escrow"
                : trade.status === "FIAT_SENT"
                  ? "💸 Payment Sent to Seller"
                  : "✓ Trade Successfully Completed"}
          </AppText>
          <AppText weight="bold" className="text-[10px] text-white/40">
            ⏱️ {timeRemaining || "..."}
          </AppText>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Counterparty Info */}
        <View className="glass rounded-2xl p-6 mb-4 relative overflow-hidden">
          {counterparty.pillars?.risk?.label === "Low" && (
            <View className="absolute top-0 left-0 right-0 bg-red-500/20 py-1 items-center">
              <AppText variant="label" weight="bold" className="text-red-500">High Risk Counterparty</AppText>
            </View>
          )}
          
          <AppText variant="caption" className="text-white/40 mb-4 pt-2">Trading with</AppText>

          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-blue-500/20 rounded-full mr-4 items-center justify-center border border-blue-500/30">
              <AppText className="text-white text-2xl">👤</AppText>
            </View>
            <View className="flex-1">
              <AppText weight="bold" className="text-lg text-white">
                {counterparty.username || "Anonymous"}
              </AppText>
              <View className="flex-row items-center mt-1">
                <TierBadge
                  tier={counterparty.fairTier}
                  score={counterparty.fairScore}
                  starRating={counterparty.starRating}
                  size="xs"
                />
              </View>
            </View>
            <TouchableOpacity 
              className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
              onPress={() => setShowRepAnalysis(true)}
            >
              <AppText variant="label" weight="extrabold" className="text-blue-400">Reputation Analysis</AppText>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-around pt-4 border-t border-white/5">
            <View className="items-center">
              <AppText weight="bold" className="text-xl text-white">
                {Math.round(
                  (counterparty.completedTrades / counterparty.totalTrades) *
                    100,
                ) || 0}
                %
              </AppText>
              <AppText variant="label" weight="bold" className="text-white/40">Completion</AppText>
            </View>
            <View className="items-center">
              <AppText weight="bold" className="text-xl text-white">
                {counterparty.totalTrades}
              </AppText>
              <AppText variant="label" weight="bold" className="text-white/40">Trades</AppText>
            </View>
            <View className="items-center">
              <AppText weight="bold" className="text-xl text-white">
                {counterparty.averageRating.toFixed(1)}⭐
              </AppText>
              <AppText variant="label" weight="bold" className="text-white/40">Rating</AppText>
            </View>
          </View>
        </View>

        {/* Trade Details */}
        <View className="glass rounded-2xl p-6 mb-4">
          <AppText variant="label" className="text-white/40 mb-4">Trade Details</AppText>

          <View className="space-y-3">
            <View className="flex-row justify-between border-b border-white/5 pb-2">
              <AppText className="text-white/60">You're buying</AppText>
              <AppText weight="bold" className="text-white">
                {formatCrypto(trade.cryptoAmount, trade.offer.cryptoAsset)}
              </AppText>
            </View>
            <View className="flex-row justify-between border-b border-white/5 pb-2">
              <AppText className="text-white/60">You'll pay</AppText>
              <AppText weight="bold" className="text-white">
                {formatCurrency(trade.fiatAmount, trade.offer.fiatCurrency)}
              </AppText>
            </View>
            <View className="flex-row justify-between border-b border-white/5 pb-2">
              <AppText className="text-white/60">Payment method</AppText>
              <AppText weight="bold" className="text-white">
                {trade.offer.paymentMethod.replace(/_/g, " ")}
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText className="text-white/60">
                Network Fee ({(trade.feePercentage * 100).toFixed(2)}%)
              </AppText>
              <View className="items-end">
                <AppText weight="bold" className="text-white">
                  {formatCrypto(trade.fee, trade.offer.cryptoAsset)}
                </AppText>
                <AppText className="text-[8px] text-white/30">Tier-based discount active</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Escrow Timeline */}
        <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
          <AppText className="text-sm text-white/60 mb-6">Escrow Status</AppText>

          <View className="space-y-6">
            <TimelineStep
              icon="✅"
              title="Offer accepted"
              timestamp="2 min ago"
              completed
            />
            <TimelineStep
              icon="✅"
              title="Funds locked in escrow"
              timestamp="1 min ago"
              completed
            />
            <TimelineStep
              icon={isFiatSent ? "✅" : "🔄"}
              title="Waiting for payment"
              timestamp={isFiatSent ? "Just now" : undefined}
              completed={isFiatSent}
              active={!isFiatSent}
            />
            <TimelineStep
              icon="⏳"
              title="Confirm payment received"
              completed={false}
            />
            <TimelineStep icon="⏳" title="Release funds" completed={false} />
          </View>
        </View>

        {/* Payment Instructions */}
        <View className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-4">
          <TouchableOpacity className="flex-row items-center justify-between mb-4">
            <AppText weight="semibold" className="text-lg text-white">
              Payment Instructions
            </AppText>
            <AppText className="text-indigo-400">▼</AppText>
          </TouchableOpacity>

          <View className="bg-white/5 rounded-lg p-4 space-y-2">
            <View className="flex-row justify-between">
              <AppText className="text-white/60">Amount</AppText>
              <AppText weight="semibold" className="text-white">
                {formatCurrency(trade.fiatAmount, trade.offer.fiatCurrency)}
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText className="text-white/60">Bank</AppText>
              <AppText weight="semibold" className="text-white">
                {trade.offer.paymentDetails.bankName}
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText className="text-white/60">Account</AppText>
              <AppText weight="semibold" className="text-white">
                {trade.offer.paymentDetails.accountNumber}
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText className="text-white/60">Reference</AppText>
              <AppText weight="semibold" className="text-indigo-400">
                #{trade.id.slice(0, 8)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Safety Notice */}
        <View className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
          <AppText weight="medium" className="text-yellow-400 mb-2">⚠️ Important</AppText>
          <AppText variant="caption" className="text-yellow-500/70">
            Only confirm after verifying payment in your bank account. Funds are
            safely held in Solana escrow.
          </AppText>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          {isSeller && isPending && (
            <TouchableOpacity 
              className="bg-blue-600 rounded-full py-4 shadow-sm"
              onPress={() => handleDeposit()}
            >
              <AppText weight="bold" className="text-white text-center text-lg">
                Deposit into Escrow
              </AppText>
            </TouchableOpacity>
          )}

          {isBuyer && isEscrowed && (
            <TouchableOpacity 
              className="bg-blue-600 rounded-full py-4 shadow-sm"
              onPress={() => markSent()}
            >
              <AppText weight="bold" className="text-white text-center text-lg">
                I've Sent the Payment
              </AppText>
            </TouchableOpacity>
          )}

          {isSeller && isFiatSent && (
            <TouchableOpacity 
              className="bg-green-600 rounded-full py-4 shadow-sm"
              onPress={() => handleRelease()}
            >
              <AppText weight="bold" className="text-white text-center text-lg">
                Confirm & Release Crypto
              </AppText>
            </TouchableOpacity>
          )}

          {isBuyer && isFiatSent && (
             <View className="bg-purple-500/10 p-4 rounded-xl items-center border border-purple-500/20">
               <AppText weight="medium" className="text-purple-400">Payment reported. Waiting for seller to release.</AppText>
             </View>
          )}

          <View className="flex-row space-x-3">
            <TouchableOpacity 
              className="flex-1 border-2 border-blue-500 rounded-full py-3"
              onPress={() => router.push(`/trade/chat?id=${id}`)}
            >
              <AppText weight="semibold" className="text-blue-600 text-center">
                💬 Chat
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border-2 border-red-500 rounded-full py-3">
              <AppText weight="semibold" className="text-red-600 text-center">
                ⚠️ Dispute
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escrow Info */}
        <View className="items-center mb-8">
          <AppText variant="caption" className="text-white/40 text-center mb-1">
            Funds are safely held in Solana escrow
          </AppText>
          {trade.escrowSignature && (
            <TouchableOpacity onPress={() => Linking.openURL(getExplorerUrl(trade.escrowSignature))}>
              <AppText variant="caption" className="text-indigo-400 underline text-center">
                🔗 View Proof on Explorer: {trade.escrowSignature.slice(0, 8)}...
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TimelineStep({ icon, title, timestamp, completed, active }: any) {
  return (
    <View className="flex-row items-start mb-6">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
          completed ? "bg-green-500/10" : active ? "bg-blue-500/10" : "bg-white/5"
        }`}
      >
        <AppText className="text-lg">{icon}</AppText>
      </View>
      <View className="flex-1">
        <AppText
          weight="medium"
          className={`${completed ? "text-white" : "text-white/40"}`}
        >
          {title}
        </AppText>
        {timestamp && (
          <AppText variant="label" className="text-white/20 mt-1">{timestamp}</AppText>
        )}
      </View>
    </View>
  );
}
