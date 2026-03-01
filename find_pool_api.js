const https = require('https');

// Orca whirlpool list API
const url = 'https://api.mainnet.orca.so/v1/whirlpool/list';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const pools = json.whirlpools || json;
    const SOL  = 'So11111111111111111111111111111111111111112';
    const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    const solUsdc = pools.filter(p =>
      (p.tokenA?.mint === SOL && p.tokenB?.mint === USDC) ||
      (p.tokenA?.mint === USDC && p.tokenB?.mint === SOL)
    );

    console.log('Pools SOL/USDC encontrados:', solUsdc.length);
    solUsdc.forEach(p => {
      console.log('Pool:', p.address);
      console.log('  tickSpacing:', p.tickSpacing);
      console.log('  TVL:', p.tvl);
      console.log('  tokenVaultA:', p.tokenVaultA);
      console.log('  tokenVaultB:', p.tokenVaultB);
      console.log('');
    });
  });
}).on('error', console.error);
