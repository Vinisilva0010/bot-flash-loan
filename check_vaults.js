const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

async function check() {
  // Candidatos a token_vault_a e token_vault_b baseado no layout do Whirlpool
  const candidates = [
    { offset: 104, addr: '6vVhfVBDTUmR2KFKzu5SHfuCtdVnF6qnq7MeD8xM8DPT' },
    { offset: 112, addr: '7gXMePBKYnYHYSvwG4yKMH6344uWnf1fTHz7gbFDZ8Fy' },
    { offset: 136, addr: 'EMNDMeyj2kV1NTAQTxhUVfMK4cMqAxdvFuEvF9iLchHn' },
    { offset: 144, addr: 'EJyLkgFJnfT7UPxCba94dgwQXFZPdxQeeJJGxVPSccfq' },
    { offset: 184, addr: 'HQUsFhQTcpngj3dzoqb7e9rQN6Apr7K1YiCmLXcKQzQr' },
    { offset: 192, addr: '8BQ9RS3afQAVCEAoWzJUBuJKjX5c3t1vee8MiBuSQZUe' },
    { offset: 200, addr: 'E7WfwLCskg1KouSxJgBxhVvohXmj8JLUCUEWa6DiBEv1' },
    { offset: 208, addr: 'DmQpWWuUuGJ3bWHm15KcUjhYrSqSqqGpcrJCaEivUEC' },
  ];

  const SOL_MINT  = 'So11111111111111111111111111111111111111112';
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  for (const c of candidates) {
    try {
      const info = await conn.getAccountInfo(new PublicKey(c.addr));
      if (info && info.data.length >= 64) {
        const mint = new PublicKey(info.data.slice(0, 32)).toBase58();
        const label = mint === SOL_MINT ? '🟡 SOL vault' : mint === USDC_MINT ? '🔵 USDC vault' : '❓ other';
        console.log(`offset ${c.offset}: ${c.addr}`);
        console.log(`  mint: ${mint} ${label}`);
        console.log(`  owner: ${info.owner.toBase58()}`);
      }
    } catch(e) {}
  }
}
check().catch(console.error);
