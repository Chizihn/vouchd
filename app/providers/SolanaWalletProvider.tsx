import React, { createContext, useContext } from "react";
import { useSolanaWallet, WalletAccount } from "../hooks/useSolanaWallet";
import { Transaction, TransactionSignature } from "@solana/web3.js";

interface SolanaWalletContextType {
  account: WalletAccount | null;
  connecting: boolean;
  connectWallet: () => Promise<any>;
  disconnectWallet: () => void;
  sendTransaction: (transaction: Transaction) => Promise<TransactionSignature>;
  getBalance: () => Promise<number>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transaction: Transaction) => Promise<string>;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(
  undefined
);

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wallet = useSolanaWallet();
  return (
    <SolanaWalletContext.Provider value={wallet}>
      {children}
    </SolanaWalletContext.Provider>
  );
};

export const useSolana = () => {
  const context = useContext(SolanaWalletContext);
  if (context === undefined) {
    throw new Error("useSolana must be used within a SolanaWalletProvider");
  }
  return context;
};
