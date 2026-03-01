const { Connection, PublicKey, Keypair, SystemTransaction, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const fs = require('fs');
const os = require('os');

const ORCA_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const POOL         = new PublicKey('Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE');

const [oracle] = PublicKey.findProgramAddressSync(
    [Buffer.from('oracle'), POOL.toBuffer()],
    ORCA_PROGRAM
);
console.log('Oracle PDA:', oracle.toBase58());

// Gera JSON de conta vazia com owner = Orca program
// Tamanho mínimo aceito pelo Whirlpool para oracle = 97 bytes (tamanho padrão do WhirlpoolsConfig)
const accountJson = {
    account: {
        data: [Buffer.alloc(97).toString('base64'), 'base64'],
        executable: false,
        lamports: 1461600,
        owner: ORCA_PROGRAM.toBase58(),
        rentEpoch: 18446744073709551615,
        space: 97
    },
    pubkey: oracle.toBase58()
};

fs.writeFileSync('/home/vnspo/flash_loan_bot/accounts/orca_oracle.json', JSON.stringify(accountJson));
console.log('✅ oracle.json criado:', oracle.toBase58());
