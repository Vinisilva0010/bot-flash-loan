const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');

async function findOffset() {
  const BANK = new PublicKey('2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB');
  const GROUP = '4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8';
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const MARGINFI_PROGRAM = new PublicKey('MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA');

  const info = await conn.getAccountInfo(BANK);
  const data = info.data;
  console.log('Data size:', data.length);

  // Varre todos os offsets buscando GROUP e USDC_MINT
  for (let offset = 0; offset + 32 <= data.length; offset += 8) {
    try {
      const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58();
      if (pk === GROUP)     console.log('GROUP    no offset:', offset);
      if (pk === USDC_MINT) console.log('USDC_MINT no offset:', offset);
    } catch(e) {}
  }

  // Agora busca todos os bancos USDC sem filtro de group
  const bs58 = require('bs58');
  const { sha256 } = require('@noble/hashes/sha256');
  const disc = Buffer.from(sha256('account:Bank')).subarray(0, 8);
  const discB58 = bs58.default ? bs58.default.encode(disc) : bs58.encode(disc);

  const accounts = await conn.getProgramAccounts(MARGINFI_PROGRAM, {
    filters: [
      { memcmp: { offset: 0,  bytes: discB58 } },
      { memcmp: { offset: 8,  bytes: bs58.default ? bs58.default.encode(Buffer.from(new PublicKey(USDC_MINT).toBytes())) : bs58.encode(Buffer.from(new PublicKey(USDC_MINT).toBytes())) } },
    ],
    dataSlice: { offset: 0, length: 400 },
  });

  console.log('\nBancos USDC encontrados:', accounts.length);
  for (const a of accounts) {
    const d = a.account.data;
    const vault = new PublicKey(d.slice(344, 376));
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('liquidity_vault'), a.pubkey.toBuffer()], MARGINFI_PROGRAM
    );
    const [authPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('liquidity_vault_auth'), a.pubkey.toBuffer()], MARGINFI_PROGRAM
    );
    const aligned = vault.toBase58() === vaultPDA.toBase58();
    if (aligned) {
      console.log('✅ Bank:', a.pubkey.toBase58());
      console.log('   Vault:', vault.toBase58());
      console.log('   Auth: ', authPDA.toBase58());
    }
  }
}
findOffset().catch(console.error);
