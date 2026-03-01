const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

async function check() {
  // Pool principal SOL/USDC com maior TVL ($32M, tickSpacing 4)
  const POOL = new PublicKey('Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE');
  const info = await conn.getAccountInfo(POOL);
  const data = info.data;
  console.log('Data size:', data.length);
  const mintA  = new PublicKey(data.slice(101, 133)).toBase58();
  const vaultA = new PublicKey(data.slice(133, 165)).toBase58();
  const mintB  = new PublicKey(data.slice(165, 197)).toBase58();
  const vaultB = new PublicKey(data.slice(197, 229)).toBase58();
  console.log('mint_a: ', mintA);
  console.log('vault_a:', vaultA);
  console.log('mint_b: ', mintB);
  console.log('vault_b:', vaultB);

  // Busca também tick arrays e oracle para esse pool
  const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
  const [oracle] = PublicKey.findProgramAddressSync(
    [Buffer.from('oracle'), POOL.toBuffer()],
    WHIRLPOOL_PROGRAM
  );
  console.log('oracle:', oracle.toBase58());

  // tick arrays para tick_spacing=4, tick_current_index
  const tickCurrent = data.readInt32LE(261); // offset do tick_current_index
  console.log('tick_current_index:', tickCurrent);
}
check().catch(console.error);
