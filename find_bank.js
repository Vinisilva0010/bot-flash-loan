const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

async function findMainBank() {
  const GROUP = new PublicKey('4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8');
  const MARGINFI_PROGRAM = new PublicKey('MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA');
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const bs58 = require('bs58');
  const { sha256 } = require('@noble/hashes/sha256');

  const disc = Buffer.from(sha256('account:Bank')).subarray(0, 8);
  const discB58 = bs58.default ? bs58.default.encode(disc) : bs58.encode(disc);

  const accounts = await conn.getProgramAccounts(MARGINFI_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: discB58 } }],
  });

  console.log('Total banks:', accounts.length);

  for (const a of accounts) {
    const data = a.account.data;
    try {
      const mint  = new PublicKey(data.slice(8,  40));
      const group = new PublicKey(data.slice(40, 72));
      if (
        mint.toBase58()  === USDC_MINT.toBase58() &&
        group.toBase58() === GROUP.toBase58()
      ) {
        const vault = new PublicKey(data.slice(344, 376));
        const [vaultPDA]     = PublicKey.findProgramAddressSync(
          [Buffer.from('liquidity_vault'), a.pubkey.toBuffer()], MARGINFI_PROGRAM
        );
        const [vaultAuthPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('liquidity_vault_auth'), a.pubkey.toBuffer()], MARGINFI_PROGRAM
        );
        const aligned = vault.toBase58() === vaultPDA.toBase58();
        console.log(aligned ? '✅ ALINHADO' : '⚠️  DESALINHADO', '| Bank:', a.pubkey.toBase58());
        console.log('   Vault real:   ', vault.toBase58());
        console.log('   Vault PDA:    ', vaultPDA.toBase58());
        console.log('   VaultAuth PDA:', vaultAuthPDA.toBase58());
        console.log('');
      }
    } catch(e) {}
  }
}
findMainBank().catch(console.error);
