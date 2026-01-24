import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { Buffer } from "buffer";

export const SOLANA_CONFIG = {
  CLUSTER:
    (process.env.EXPO_PUBLIC_SOLANA_CLUSTER as
      | "mainnet-beta"
      | "devnet"
      | "testnet") || "devnet",
  RPC_ENDPOINT: clusterApiUrl("devnet"),
  CONNECTION_CONFIG: {
    commitment: "confirmed" as const,
    confirmTransactionInitialTimeout: 60_000,
  },
  MAX_AIRDROP_AMOUNT: 2,
  USDC_MINT: new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"), // Devnet USDC
};

let _connection: Connection | null = null;
export const getConnection = (): Connection => {
  if (!_connection) {
    _connection = new Connection(
      SOLANA_CONFIG.RPC_ENDPOINT,
      SOLANA_CONFIG.CONNECTION_CONFIG
    );
  }
  return _connection;
};

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const decodeTransaction = (base64String: string): Transaction => {
  try {
    const bytes = Buffer.from(base64String, "base64");
    return Transaction.from(bytes);
  } catch (e) {
    console.error(e);
    throw new Error("Invalid base64 transaction");
  }
};

export const getExplorerUrl = (
  signature: string,
  type: "tx" | "address" = "tx",
): string => {
  const cluster = SOLANA_CONFIG.CLUSTER === "mainnet-beta" ? "" : `?cluster=${SOLANA_CONFIG.CLUSTER}`;
  return `https://explorer.solana.com/${type}/${signature}${cluster}`;
};
