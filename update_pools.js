const fs = require('fs');

const POOLS = {
  // Pool principal — maior TVL ($32M), tickSpacing 4
  PRIMARY: {
    address:  'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE',
    tickSpacing: 4,
    tokenVaultA: 'EUuUbDcafPrmVTD5M6qoJAoyyNbihBhugADAxRMn5he9',
    tokenVaultB: '2WLWEuKDgkDUccTpbwYp1GToYktiSB1cXvreHUwiSUVP',
    oracle:      'FoKYKtRpD25TKzBMndysKpgPqbj8AdLXjfpYHXn9PGTX',
    tvl: 32526289,
  },
  // Pool secundário — tickSpacing 2
  SECONDARY: {
    address:  'FpCMFDFGYotvufJ7HrFHsWEiiQCGbkLCtwHiDnh7o28Q',
    tickSpacing: 2,
    tokenVaultA: '6mQ8xEaHdTikyMvvMxUctYch6dUjnKgfoeib2msyMMi1',
    tokenVaultB: 'AQ36QRk3HAe6PHqBCtKTQnYKpt2kAagq9YoeTqUPMGHx',
    oracle:      '923j69hYbT5Set5kYfiQr1D8jPL6z15tbfTbVLSwUWJD',
    tvl: 578844,
  },
  // Pool terciário — tickSpacing 1
  TERTIARY: {
    address:  '83v8iPyZihDEjDdY8RdZddyZNyUtXngz69Lgo9Kt5d6d',
    tickSpacing: 1,
    tokenVaultA: 'D3CDPQLoa9jY1LXCkpUqd3JQDWz8DX1LDE1dhmJt9fq4',
    tokenVaultB: 'dwxR9YF7WwnJJu7bPC4UNcWFpcSsooH6fxbpoa3fTbJ',
    oracle:      'GwRSc3EPw2fCLJN7zWwcApXgHSrfmj9m4H5sfk1W2SUJ',
    tvl: 34757,
  },
};

console.log(JSON.stringify(POOLS, null, 2));

// Mostra os valores prontos para colar no .ts
console.log('\n--- Copie para o seu bot ---\n');
for (const [k, p] of Object.entries(POOLS)) {
  console.log(`// ${k} (TVL ~$${p.tvl.toLocaleString()}, tickSpacing ${p.tickSpacing})`);
  console.log(`const WHIRLPOOL_${k}         = new PublicKey("${p.address}");`);
  console.log(`const TOKEN_VAULT_A_${k}     = new PublicKey("${p.tokenVaultA}");`);
  console.log(`const TOKEN_VAULT_B_${k}     = new PublicKey("${p.tokenVaultB}");`);
  console.log(`const ORACLE_${k}            = new PublicKey("${p.oracle}");`);
  console.log('');
}
