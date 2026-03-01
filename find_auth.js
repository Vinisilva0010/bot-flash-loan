const { PublicKey } = require('@solana/web3.js');
const MARGINFI_PROGRAM = new PublicKey('MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA');
const BANK  = new PublicKey('2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB');
const VAULT = new PublicKey('ErMhqviiUMJHijsN5ENtVdEjAsSGkQfk8cdh1agEZ7Mq');

// Testa todas as combinações possíveis de seeds para vault_auth
const seeds_variants = [
  [Buffer.from('liquidity_vault_auth'), BANK.toBuffer()],
  [Buffer.from('liquidity_vault_auth'), VAULT.toBuffer()],
  [Buffer.from('vault_auth'),           BANK.toBuffer()],
  [Buffer.from('vault_auth'),           VAULT.toBuffer()],
  [Buffer.from('authority'),            BANK.toBuffer()],
  [Buffer.from('authority'),            VAULT.toBuffer()],
  [Buffer.from('marginfi_bank_vault_authority'), BANK.toBuffer()],
  [Buffer.from('marginfi_bank_vault_authority'), VAULT.toBuffer()],
];

for (const seeds of seeds_variants) {
  try {
    const [pda, bump] = PublicKey.findProgramAddressSync(seeds, MARGINFI_PROGRAM);
    console.log(`seeds: [${seeds.map(s => Buffer.isBuffer(s) && s.length === 32 ? s.toString('hex').slice(0,8)+'...' : s.toString())}]`);
    console.log(`  PDA: ${pda.toBase58()} bump: ${bump}`);
  } catch(e) {
    console.log('erro:', e.message);
  }
}
