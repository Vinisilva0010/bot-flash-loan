const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

// Layout EXATO do Whirlpool conforme código fonte do Orca SDK
// https://github.com/orca-so/whirlpools/blob/main/sdk/src/types/public/anchor-types.ts
// discriminator(8) + whirlpools_config(32) + whirlpool_bump[1](1) + tick_spacing(2)
// + tick_spacing_seed[2](2) + fee_rate(2) + protocol_fee_rate(2) + liquidity(16)
// + sqrt_price(16) + tick_current_index(4) + protocol_fee_owed_a(8) + protocol_fee_owed_b(8)
// + token_mint_a(32) + token_vault_a(32) + fee_growth_global_a(16)
// + token_mint_b(32) + token_vault_b(32)
// offsets: mint_a=101, vault_a=133, fee_growth_a=165, mint_b=181, vault_b=213

const POOLS = [
  'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE',
  'FpCMFDFGYotvufJ7HrFHsWEiiQCGbkLCtwHiDnh7o28Q',
  '83v8iPyZihDEjDdY8RdZddyZNyUtXngz69Lgo9Kt5d6d',
];
const SOL  = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');

async function check() {
  for (const addr of POOLS) {
    const info = await conn.getAccountInfo(new PublicKey(addr));
    const d = info.data;
    const mintA  = new PublicKey(d.slice(101, 133)).toBase58();
    const vaultA = new PublicKey(d.slice(133, 165)).toBase58();
    const mintB  = new PublicKey(d.slice(181, 213)).toBase58();
    const vaultB = new PublicKey(d.slice(213, 245)).toBase58();
    const tick   = d.readInt32LE(265);
    const [oracle] = PublicKey.findProgramAddressSync(
      [Buffer.from('oracle'), new PublicKey(addr).toBuffer()],
      WHIRLPOOL_PROGRAM
    );
    const ok = mintA === SOL && mintB === USDC;
    console.log(ok ? '✅' : '❌', addr);
    console.log('  mintA:', mintA, ok ? '(SOL ✅)' : '');
    console.log('  vaultA:', vaultA);
    console.log('  mintB:', mintB, mintB === USDC ? '(USDC ✅)' : '');
    console.log('  vaultB:', vaultB);
    console.log('  tick_current:', tick);
    console.log('  oracle:', oracle.toBase58());
    console.log('');
  }
}
check().catch(console.error);
