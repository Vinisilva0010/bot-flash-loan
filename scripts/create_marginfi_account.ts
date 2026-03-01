import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { sha256 } from "@noble/hashes/sha256";

const MARGINFI_PROGRAM = new PublicKey("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA");
const MARGINFI_GROUP   = new PublicKey("4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8");

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  const mfAccount = anchor.web3.Keypair.generate();
  const disc = Buffer.from(sha256("global:marginfi_account_initialize")).slice(0, 8);

  const ix = new anchor.web3.TransactionInstruction({
    programId: MARGINFI_PROGRAM,
    keys: [
      { pubkey: MARGINFI_GROUP,          isSigner: false, isWritable: false },
      { pubkey: mfAccount.publicKey,     isSigner: true,  isWritable: true  },
      { pubkey: wallet.publicKey,        isSigner: true,  isWritable: true  }, // authority
      { pubkey: wallet.publicKey,        isSigner: true,  isWritable: true  }, // fee_payer
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: disc,
  });

  const tx = new anchor.web3.Transaction().add(ix);
  const sig = await provider.sendAndConfirm(tx, [mfAccount]);
  console.log("✅ Marginfi account criada:", mfAccount.publicKey.toString());
  console.log("   Signature:", sig);
}

main().catch(console.error);
