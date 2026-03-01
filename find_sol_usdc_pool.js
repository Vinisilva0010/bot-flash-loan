const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

const WHIRLPOOL_PROGRAM = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc';
const SOL_MINT  = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Pools SOL/USDC conhecidos da Orca mainnet
const candidates = [
  'HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ', // atual (errado)
  '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm', // SOL/USDC 64
  'EGZ7tiLeH62TPV1gL8WwbXGzEPa9zmcpVnnkPKKnrE2U', // SOL/USDC outro
  '4fuUiYxTQ6QCrdSq9ouBYcTM7bqSwYTSyLueGZLTy4T4', // SOL/USDC 1bp
];

async function check() {
  for (const addr of candidates) {
    try {
      const info = await conn.getAccountInfo(new PublicKey(addr));
      if (!info) { console.log('NAO EXISTE:', addr); continue; }
      const data = info.data;
      const mintA  = new PublicKey(data.slice(101, 133)).toBase58();
      const vaultA = new PublicKey(data.slice(133, 165)).toBase58();
      const mintB  = new PublicKey(data.slice(165, 197)).toBase58();
      const vaultB = new PublicKey(data.slice(197, 229)).toBase58();
      const isTarget = mintA === SOL_MINT && mintB === USDC_MINT;
      console.log(isTarget ? '✅ SOL/USDC' : '❌ outro par', addr);
      console.log('  mintA:', mintA);
      console.log('  mintB:', mintB);
      if (isTarget) {
        console.log('  token_vault_a (SOL):', vaultA);
        console.log('  token_vault_b (USDC):', vaultB);
      }
    } catch(e) { console.log('ERRO:', addr, e.message); }
  }
}
check().catch(console.error);
