const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const SOL_MINT  = new PublicKey('So11111111111111111111111111111111111111112');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

const encode = b => bs58.default ? bs58.default.encode(b) : bs58.encode(b);

async function find() {
  // Filtra pools com token_mint_a = SOL (offset 101) e token_mint_b = USDC (offset 165)
  const accounts = await conn.getProgramAccounts(WHIRLPOOL_PROGRAM, {
    filters: [
      { dataSize: 653 },
      { memcmp: { offset: 101, bytes: encode(SOL_MINT.toBytes()) } },
      { memcmp: { offset: 165, bytes: encode(USDC_MINT.toBytes()) } },
    ],
    dataSlice: { offset: 0, length: 300 },
  });

  console.log('Pools SOL/USDC encontrados:', accounts.length);
  for (const a of accounts) {
    const data = a.account.data;
    const vaultA = new PublicKey(data.slice(133, 165)).toBase58();
    const vaultB = new PublicKey(data.slice(197, 229)).toBase58();
    // tick_spacing está no offset 41 (2 bytes)
    const tickSpacing = data.readUInt16LE(41);
    console.log('Pool:', a.pubkey.toBase58(), '| tick_spacing:', tickSpacing);
    console.log('  token_vault_a (SOL): ', vaultA);
    console.log('  token_vault_b (USDC):', vaultB);
  }
}
find().catch(console.error);
