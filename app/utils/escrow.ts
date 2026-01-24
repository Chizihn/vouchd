import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Buffer } from "buffer";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbVNBH4DQ3iwvbeDep6fun265h");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// The Program ID from Playground
export const ESCROW_PROGRAM_ID = new PublicKey(
  process.env.EXPO_PUBLIC_ESCROW_PROGRAM_ID || "Dn6U1SGpgMh6UPDJGhpitgQEa9Uzyv4upJt2ofNVs8EC"
);

// Helper to calculate Anchor instruction discriminators
// For Anchor, the discriminator is sha256("global:<name>").slice(0, 8)
const getDiscriminator = (name: string): Buffer => {
  const discriminators: Record<string, string> = {
    release_to_buyer: "af44c6414046c57c",
    create_escrow: "e10a2f4850937a44",
    refund_to_seller: "b0b2302381926673"
  };
  return Buffer.from(discriminators[name], "hex");
};

export class EscrowClient {
  /**
   * Derive the Escrow PDA
   */
  static getEscrowPda(seller: PublicKey, tradeId: string) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), seller.toBuffer(), Buffer.from(tradeId)],
      ESCROW_PROGRAM_ID
    );
  }

  /**
   * Derive the Vault ATA (owned by the Escrow PDA)
   */
  static getVaultAta(escrowPda: PublicKey, mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [escrowPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }

  /**
   * Derive the Associated Token Account (ATA) for a wallet and mint
   */
  static getAta(wallet: PublicKey, mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }

  /**
   * Construct the Create Escrow instruction
   */
  static createCreateEscrowInstruction(
    seller: PublicKey,
    buyer: PublicKey,
    sellerTokenAccount: PublicKey,
    mint: PublicKey,
    tradeId: string,
    amount: number
  ): TransactionInstruction {
    const [escrowPda] = this.getEscrowPda(seller, tradeId);
    const [vaultTokenAccount] = this.getVaultAta(escrowPda, mint);
    const discriminator = getDiscriminator("create_escrow");

    // Amount needs to be a Buffer for Anchor (u64)
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(BigInt(amount), 0);
    
    const tradeIdBuffer = Buffer.from(tradeId);
    const tradeIdLenBuffer = Buffer.alloc(4);
    tradeIdLenBuffer.writeUInt32LE(tradeId.length, 0);

    const data = Buffer.concat([
      discriminator,
      tradeIdLenBuffer,
      tradeIdBuffer,
      amountBuffer
    ]);

    return new TransactionInstruction({
      programId: ESCROW_PROGRAM_ID,
      keys: [
        { pubkey: seller, isSigner: true, isWritable: true },
        { pubkey: buyer, isSigner: false, isWritable: false },
        { pubkey: sellerTokenAccount, isSigner: false, isWritable: true },
        { pubkey: escrowPda, isSigner: false, isWritable: true },
        { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      data,
    });
  }

  /**
   * Construct the Release Escrow instruction
   */
  static createReleaseInstruction(
    seller: PublicKey,
    buyer: PublicKey,
    mint: PublicKey,
    tradeId: string
  ): TransactionInstruction {
    const [escrowPda] = this.getEscrowPda(seller, tradeId);
    const [vaultTokenAccount] = this.getVaultAta(escrowPda, mint);
    const [buyerTokenAccount] = this.getAta(buyer, mint);
    const discriminator = getDiscriminator("release_to_buyer");

    return new TransactionInstruction({
      programId: ESCROW_PROGRAM_ID,
      keys: [
        { pubkey: seller, isSigner: true, isWritable: true },
        { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
        { pubkey: escrowPda, isSigner: false, isWritable: true },
        { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: discriminator,
    });
  }
}
