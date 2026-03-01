import { WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID } from "@orca-so/whirlpools-sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";

const POOLS = [
  'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE',
  'FpCMFDFGYotvufJ7HrFHsWEiiQCGbkLCtwHiDnh7o28Q',
  '83v8iPyZihDEjDdY8RdZddyZNyUtXngz69Lgo9Kt5d6d',
];

async function main() {
  const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');
  const wallet = { publicKey: Keypair.generate().publicKey, signTransaction: async (t: any) => t, signAllTransactions: async (t: any) => t };
  const provider = new AnchorProvider(conn, wallet as any, {});
  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
  const client = buildWhirlpoolClient(ctx);

  for (const addr of POOLS) {
    try {
      const pool = await client.getPool(new PublicKey(addr));
      const data = pool.getData();
      console.log('Pool:', addr);
      console.log('  tokenMintA:      ', data.tokenMintA.toBase58());
      console.log('  tokenVaultA:     ', data.tokenVaultA.toBase58());
      console.log('  tokenMintB:      ', data.tokenMintB.toBase58());
      console.log('  tokenVaultB:     ', data.tokenVaultB.toBase58());
      console.log('  tickSpacing:     ', data.tickSpacing);
      console.log('  tickCurrentIndex:', data.tickCurrentIndex);
      console.log('');
    } catch(e: any) { console.log('ERRO', addr, ':', e.message); }
  }
}
main().catch(console.error);
