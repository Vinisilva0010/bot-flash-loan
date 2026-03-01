const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

async function check() {
  const pool = new PublicKey('HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ');
  const info = await conn.getAccountInfo(pool);
  const data = info.data;
  console.log('Pool data size:', data.length);

  const SOL  = 'So11111111111111111111111111111111111111112';
  const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  for (let offset = 8; offset + 32 <= data.length; offset += 8) {
    try {
      const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58();
      if (pk === SOL)  console.log('SOL_MINT   offset:', offset);
      if (pk === USDC) console.log('USDC_MINT  offset:', offset);
      const isKnown = pk === SOL || pk === USDC;
      const isZero  = pk.startsWith('1111111');
      if (!isKnown && !isZero) {
        console.log('offset', offset, ':', pk);
      }
    } catch(e) {}
  }
}
check().catch(console.error);
