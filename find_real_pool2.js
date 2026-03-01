const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const SOL_MINT  = new PublicKey('So11111111111111111111111111111111111111112');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const encode = b => bs58.default ? bs58.default.encode(b) : bs58.encode(b);

async function find() {
  // Só filtra por mint_a = SOL no offset 101
  const accounts = await conn.getProgramAccounts(WHIRLPOOL_PROGRAM, {
    filters: [
      { memcmp: { offset: 101, bytes: encode(SOL_MINT.toBytes()) } },
    ],
    dataSlice: { offset: 0, length: 300 },
  });

  console.log('Pools com SOL como token_a:', accounts.length);
  for (const a of accounts) {
    const data = a.account.data;
    try {
      const mintB = new PublicKey(data.slice(165, 197)).toBase58();
      if (mintB === USDC_MINT.toBase58()) {
        const vaultA = new PublicKey(data.slice(133, 165)).toBase58();
        const vaultB = new PublicKey(data.slice(197, 229)).toBase58();
        const tickSpacing = data.readUInt16LE(41);
        console.log('✅ SOL/USDC Pool:', a.pubkey.toBase58(), '| tick_spacing:', tickSpacing);
        console.log('   token_vault_a (SOL): ', vaultA);
        console.log('   token_vault_b (USDC):', vaultB);
      }
    } catch(e) {}
  }
}
find().catch(console.error);
