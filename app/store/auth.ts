import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export interface User {
  id: string;
  walletAddress: string;
  fairScore: number | null;
  walletScore: number | null;
  socialScore: number | null;
  starRating: number | null;
  fairTier: string | null;
  fairBadges: string[];
  username: string | null;
  email: string | null;
  totalTrades: number;
  completedTrades: number;
  averageRating: number;
  createdAt: string;
  kycVerified: boolean;
  capabilities?: {
    canSell: boolean;
    maxTradeAmount: number;
    dailyLimit: number;
    feePercentage: number;
    maxActiveOffers: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletProvider: string | null;
  walletProviderName: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setWalletProvider: (
    providerUri: string | null,
    name: string | null,
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  walletProvider: null,
  walletProviderName: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync("authToken", token);
    } else {
      await SecureStore.deleteItemAsync("authToken");
    }
    set({ token });
  },

  login: async (user, token) => {
    await SecureStore.setItemAsync("authToken", token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("wallet_provider_name");
    await SecureStore.deleteItemAsync("wallet_provider_uri");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const userStr = await SecureStore.getItemAsync("user");
      const walletProviderName = await SecureStore.getItemAsync(
        "wallet_provider_name",
      );
      const walletProvider = await SecureStore.getItemAsync(
        "wallet_provider_uri",
      );

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          walletProvider,
          walletProviderName,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          walletProvider: walletProvider ?? null,
          walletProviderName: walletProviderName ?? null,
        });
      }
    } catch (error) {
      console.error("Error loading auth:", error);
      set({ isLoading: false });
    }
  },

  setWalletProvider: async (providerUri, name) => {
    if (providerUri) {
      await SecureStore.setItemAsync("wallet_provider_uri", providerUri);
    } else {
      await SecureStore.deleteItemAsync("wallet_provider_uri");
    }

    if (name) {
      await SecureStore.setItemAsync("wallet_provider_name", name);
    } else {
      await SecureStore.deleteItemAsync("wallet_provider_name");
    }

    set({ walletProvider: providerUri, walletProviderName: name });
  },
}));
