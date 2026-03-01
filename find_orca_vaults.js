const { PublicKey } = require('@solana/web3.js');

const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const POOL = new PublicKey('HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ');

// Whirlpool vault seeds: ["token_vault_whirlpool", pool.key(), "a"] e "b"
const seeds_a = [
  [Buffer.from('token_vault_whirlpool'), POOL.toBuffer(), Buffer.from('a')],
  [Buffer.from('token_vault_a'), POOL.toBuffer()],
  [Buffer.from('vault_a'), POOL.toBuffer()],
];
const seeds_b = [
  [Buffer.from('token_vault_whirlpool'), POOL.toBuffer(), Buffer.from('b')],
  [Buffer.from('token_vault_b'), POOL.toBuffer()],
  [Buffer.from('vault_b'), POOL.toBuffer()],
];

// Endereços conhecidos do pool layout (offset não alinhado a 8)
// Whirlpool struct: discriminator(8) + whirlpools_config(32) + whirlpool_bump(1)
// + tick_spacing(2) + tick_spacing_seed(2) + fee_rate(2) + protocol_fee_rate(2)
// + liquidity(16) + sqrt_price(16) + tick_current_index(4) + protocol_fee_owed_a(8)
// + protocol_fee_owed_b(8) + token_mint_a(32) + token_vault_a(32)
// offset token_mint_a = 8+32+1+2+2+2+2+16+16+4+8+8 = 101
// offset token_vault_a = 101+32 = 133
// offset token_mint_b = 133+32 = 165
// offset token_vault_b = 165+32 = 197

const { Connection } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

conn.getAccountInfo(POOL).then(info => {
  const data = info.data;
  const mintA   = new PublicKey(data.slice(101, 133)).toBase58();
  const vaultA  = new PublicKey(data.slice(133, 165)).toBase58();
  const mintB   = new PublicKey(data.slice(165, 197)).toBase58();
  const vaultB  = new PublicKey(data.slice(197, 229)).toBase58();
  console.log('token_mint_a  (offset 101):', mintA);
  console.log('token_vault_a (offset 133):', vaultA);
  console.log('token_mint_b  (offset 165):', mintB);
  console.log('token_vault_b (offset 197):', vaultB);
}).catch(console.error);
