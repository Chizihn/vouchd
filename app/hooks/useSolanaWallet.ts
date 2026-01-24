import { useState, useCallback, useEffect } from "react";
import {
  transact,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  PublicKey,
  Transaction,
  TransactionSignature,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import {
  getConnection,
  isValidSolanaAddress,
  SOLANA_CONFIG,
} from "../utils/solana";
import { useAuthStore } from "../store/auth";
import * as SecureStore from "expo-secure-store";

export interface WalletAccount {
  address: string;
  publicKey: PublicKey;
  label?: string;
}

export interface WalletConnectionResult {
  address: string;
  publicKey: PublicKey;
  label?: string;
  auth_token: string;
}

export const useSolanaWallet = () => {
  const [connecting, setConnecting] = useState(false);
  const { setWalletProvider, walletProvider, user } = useAuthStore();
  const [account, setAccount] = useState<WalletAccount | null>(null);

  // Initialize account from user data and load wallet provider from SecureStore on mount
  useEffect(() => {
    const initializeAccount = async () => {
      try {
        // Load wallet provider from SecureStore to ensure transactions open the correct wallet
        const [storedProviderUri, storedProviderName] = await Promise.all([
          SecureStore.getItemAsync("wallet_provider_uri"),
          SecureStore.getItemAsync("wallet_provider_name"),
        ]);
        
        if (storedProviderUri || storedProviderName) {
          console.log("Restored wallet provider from SecureStore:", {
            storedProviderUri,
            storedProviderName,
          });
          await setWalletProvider(
            storedProviderUri ?? null,
            storedProviderName ?? null
          );
        }

        if (user?.walletAddress && !account) {
          const publicKey = new PublicKey(user.walletAddress);
          setAccount({
            address: user.walletAddress,
            publicKey: publicKey,
            label: undefined,
          });
        }
      } catch (error) {
        console.error("Failed to initialize wallet state:", error);
      }
    };
    initializeAccount();
  }, []);

  const connectWallet = useCallback(async (walletUri?: string): Promise<WalletConnectionResult> => {
    console.log("Attempting to connect wallet...", walletUri ? `Direct to: ${walletUri}` : "System picker");
    setConnecting(true);
    try {
      // Priority: 1) Explicit walletUri, 2) Stored provider, 3) Let system pick
      const baseUri = walletUri || walletProvider || undefined;
      console.log("Using baseUri:", baseUri);
      
      const result = await transact(async (wallet) => {
        console.log("Transact callback started. Authorizing...");
        const authResult = await wallet.authorize({
          cluster: SOLANA_CONFIG.CLUSTER,
          identity: {
            name: "Vouchd",
            uri: "https://vouchd.xyz",
            icon: "favicon.ico",
          },
        });
        console.log("Authorization successful.", authResult);

        const primaryAccount = authResult.accounts[0];
        
        // Save wallet provider for future transactions
        await setWalletProvider(
          authResult.wallet_uri_base ?? null,
          primaryAccount.label ?? null
        );
        console.log("Got account:", primaryAccount);

        // Securely store the auth token
        await SecureStore.setItemAsync(
          "solana-auth-token",
          authResult.auth_token
        );

        // Convert Uint8Array or base64 string to base58 string
        let addressString: string;

        if ((primaryAccount.address as any) instanceof Uint8Array) {
          addressString = new PublicKey(primaryAccount.address).toBase58();
        } else if (typeof primaryAccount.address === "string") {
          const buffer = Buffer.from(primaryAccount.address, "base64");
          addressString = new PublicKey(buffer).toBase58();
        } else {
          throw new Error("Invalid address format received from wallet");
        }

        console.log("Wallet address (base58):", addressString);

        if (!addressString || !isValidSolanaAddress(addressString)) {
          throw new Error(`Invalid wallet address: ${addressString}`);
        }

        console.log("Address is valid. Returning auth data.");
        return {
          address: addressString,
          publicKey: new PublicKey(addressString),
          label: primaryAccount.label,
          auth_token: authResult.auth_token,
        };
      },
      // Pass baseUri to route to specific wallet (avoids Android chooser)
      baseUri ? { baseUri } : undefined
    );

      console.log("Transact successful. Setting account.", result);
      setAccount({
        address: result.address,
        publicKey: result.publicKey,
        label: result.label,
      });

      return result;
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      throw error;
    } finally {
      console.log("connectWallet finished.");
      setConnecting(false);
    }
  }, [setWalletProvider, walletProvider]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setWalletProvider(null, null);
    SecureStore.deleteItemAsync("solana-auth-token");
    SecureStore.deleteItemAsync("wallet_provider_uri");
    SecureStore.deleteItemAsync("wallet_provider_name");
  }, [setWalletProvider]);

  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<TransactionSignature> => {
      if (!account) {
        throw new Error("No wallet connected. Please connect your wallet first.");
      }

      console.log("Sending transaction with account:", account.address);
      const connection = getConnection();

      const signature = await transact(async (wallet) => {
        const identity = {
          name: "Vouchd",
          uri: "https://vouchd.xyz",
          icon: "favicon.ico",
        };

        try {
          console.log("Attempting to re-authorize wallet session...");
          const authToken = await SecureStore.getItemAsync("solana-auth-token");
          if (!authToken) {
            throw new Error("Auth token not found.");
          }
          await wallet.reauthorize({ auth_token: authToken, identity });
          console.log("Re-authorization successful.");
        } catch (error: any) {
          console.warn(`Re-authorization failed (${error.message}), attempting full authorization...`);
          const authResult = await wallet.authorize({
            cluster: SOLANA_CONFIG.CLUSTER,
            identity,
          });
          await SecureStore.setItemAsync("solana-auth-token", authResult.auth_token);
          console.log("New authorization successful.");
        }

        console.log("Signing and sending transactions...");
        const [sent] = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
        console.log("Transaction sent with signature:", sent);
        return sent;
      },
      walletProvider ? { baseUri: walletProvider } : undefined
    );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      return signature;
    },
    [account, walletProvider]
  );

  const getBalance = useCallback(async (): Promise<number> => {
    if (!account) throw new Error("No wallet connected");
    const connection = getConnection();
    const lamports = await connection.getBalance(account.publicKey);
    return lamports / LAMPORTS_PER_SOL;
  }, [account]);

  const signMessage = useCallback(
    async (message: string, walletAddress?: string): Promise<string> => {
      // Use provided address or fall back to account state
      const addressToUse = walletAddress || account?.address;
      if (!addressToUse) throw new Error("No wallet connected");

      const signature = await transact(async (wallet) => {
        const identity = {
          name: "Vouchd",
          uri: "https://vouchd.xyz",
          icon: "favicon.ico",
        };

        try {
          const authToken = await SecureStore.getItemAsync("solana-auth-token");
          if (!authToken) throw new Error("Auth token not found");
          await wallet.reauthorize({ auth_token: authToken, identity });
        } catch (error) {
          const authResult = await wallet.authorize({
            cluster: SOLANA_CONFIG.CLUSTER,
            identity,
          });
          await SecureStore.setItemAsync("solana-auth-token", authResult.auth_token);
        }

        const messageBuffer = new Uint8Array(Buffer.from(message));
        const [signed] = await wallet.signMessages({
          payloads: [messageBuffer],
          addresses: [addressToUse],
        });
        return Buffer.from(signed).toString("base64");
      },
      walletProvider ? { baseUri: walletProvider } : undefined
    );

      return signature;
    },
    [account, walletProvider]
  );

  const signTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      if (!account) throw new Error("No wallet connected");

      const signature = await transact(async (wallet) => {
        const identity = {
          name: "Vouchd",
          uri: "https://vouchd.xyz",
          icon: "favicon.ico",
        };

        try {
          const authToken = await SecureStore.getItemAsync("solana-auth-token");
          if (!authToken) throw new Error("Auth token not found");
          await wallet.reauthorize({ auth_token: authToken, identity });
        } catch (error) {
          const authResult = await wallet.authorize({
            cluster: SOLANA_CONFIG.CLUSTER,
            identity,
          });
          await SecureStore.setItemAsync("solana-auth-token", authResult.auth_token);
        }

        const [signed] = await wallet.signTransactions({
          transactions: [transaction],
        });
        
        return signed.signatures[0].toString();
      },
      walletProvider ? { baseUri: walletProvider } : undefined
    );

      return signature;
    },
    [account, walletProvider]
  );

  return {
    account,
    connecting,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    getBalance,
    signMessage,
    signTransaction,
  };
};
