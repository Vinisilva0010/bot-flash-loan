const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc');
const MARGINFI_PROGRAM = 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA';

async function run() {
  const raw = JSON.parse(fs.readFileSync('/home/vnspo/flash_loan_bot/accounts/usdc_bank.json'));
  const data = Buffer.from(raw.account.data[0], 'base64');

  // Extrai todas as pubkeys únicas do banco (offset por 1 byte para não perder nada)
  const candidates = new Set();
  for (let offset = 0; offset + 32 <= data.length; offset++) {
    try {
      const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58();
      // Filtra System Program e endereços zerados
      if (!pk.startsWith('1111111')) candidates.add(JSON.stringify({offset, pk}));
    } catch(e) {}
  }

  const unique = [...candidates].map(s => JSON.parse(s));
  console.log('Candidatas únicas:', unique.length);

  // Verifica quais existem na chain
  for (const {offset, pk} of unique) {
    try {
      const info = await conn.getAccountInfo(new PublicKey(pk));
      if (info) {
        console.log(`offset ${offset}: ${pk}`);
        console.log(`  owner: ${info.owner.toBase58()}`);
        console.log(`  lamports: ${info.lamports}`);
        console.log(`  data: ${info.data.length} bytes`);
      }
    } catch(e) {}
  }
}
run().catch(console.error);
