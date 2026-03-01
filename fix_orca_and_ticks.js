const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const POOL              = new PublicKey('Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE');
const TICK_SPACING      = 4;
const TICK_ARRAY_SIZE   = 88; // ticks por array

function getTickArrayStartIndex(tick, spacing) {
  const arraySpan = spacing * TICK_ARRAY_SIZE; // 4 * 88 = 352
  return Math.floor(tick / arraySpan) * arraySpan;
}

async function getTickArrayPDA(startIndex) {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('tick_array'),
      POOL.toBuffer(),
      Buffer.from(startIndex.toString()),
    ],
    WHIRLPOOL_PROGRAM
  );
  return pda;
}

async function main() {
  // Lê tick_current_index do pool (offset 265 — confirmado correto)
  const info = await conn.getAccountInfo(POOL);
  const d = info.data;
  const tickCurrent = d.readInt32LE(265);
  console.log('tick_current_index:', tickCurrent);

  const arraySpan = TICK_SPACING * TICK_ARRAY_SIZE; // 352
  const start0 = getTickArrayStartIndex(tickCurrent, TICK_SPACING);
  const start1 = start0 - arraySpan;
  const start2 = start0 + arraySpan;

  console.log('tick_array_start indices:', start0, start1, start2);

  const [ta0, ta1, ta2] = await Promise.all([
    getTickArrayPDA(start0),
    getTickArrayPDA(start1),
    getTickArrayPDA(start2),
  ]);

  console.log('\n--- Cole no tests/flash_loan_bot.ts ---\n');
  console.log(`const ORCA = {`);
  console.log(`    program:    new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"),`);
  console.log(`    pool:       new PublicKey("Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE"),`);
  console.log(`    oracle:     new PublicKey("FoKYKtRpD25TKzBMndysKpgPqbj8AdLXjfpYHXn9PGTX"),`);
  console.log(`    vaultA:     new PublicKey("EUuUbDcafPrmVTD5M6qoJAoyyNbihBhugADAxRMn5he9"),`);
  console.log(`    vaultB:     new PublicKey("2WLWEuKDgkDUccTpbwYp1GToYktiSB1cXvreHUwiSUVP"),`);
  console.log(`    tickArray0: new PublicKey("${ta0.toBase58()}"),`);
  console.log(`    tickArray1: new PublicKey("${ta1.toBase58()}"),`);
  console.log(`    tickArray2: new PublicKey("${ta2.toBase58()}"),`);
  console.log(`};`);

  // Verifica se os tick arrays existem on-chain
  console.log('\n--- Verificando existência on-chain ---');
  for (const [label, pda] of [['tickArray0', ta0], ['tickArray1', ta1], ['tickArray2', ta2]]) {
    const acct = await conn.getAccountInfo(pda);
    console.log(`${label} (${pda.toBase58()}): ${acct ? `✅ existe (${acct.data.length} bytes)` : '❌ NÃO EXISTE'}`);
  }
}
main().catch(console.error);
