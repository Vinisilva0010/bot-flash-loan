const fs = require('fs');
const { PublicKey, Keypair } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync, AccountLayout, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// 1. Carregar sua carteira local (O "User")
const home = process.env.HOME;
const keypairFile = require(home + '/.config/solana/id.json');
const userKeypair = Keypair.fromSecretKey(new Uint8Array(keypairFile));
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// 2. Calcular onde deve ficar a conta de USDC do User
const userUsdcAddress = getAssociatedTokenAddressSync(USDC_MINT, userKeypair.publicKey);

// 3. Criar os dados binários da conta (1 Milhão de USDC)
const amount = BigInt(1_000_000 * 1_000_000); // 1 Milhão
const buffer = Buffer.alloc(AccountLayout.span);

AccountLayout.encode({
    mint: USDC_MINT,
    owner: userKeypair.publicKey,
    amount: amount,
    delegateOption: 0,
    delegate: PublicKey.default,
    state: 1, // Initialized
    isNativeOption: 0,
    isNative: BigInt(0),
    delegatedAmount: BigInt(0),
    closeAuthorityOption: 0,
    closeAuthority: PublicKey.default,
}, buffer);

// 4. Montar o JSON que o Validador entende
const accountJson = {
    pubkey: userUsdcAddress.toBase58(),
    account: {
        lamports: 2039280, // Rent exempt exato
        data: [buffer.toString('base64'), "base64"],
        owner: TOKEN_PROGRAM_ID.toBase58(),
        executable: false,
        rentEpoch: 0
    }
};

// 5. Salvar o arquivo
fs.writeFileSync('user_usdc.json', JSON.stringify(accountJson, null, 2));

console.log("✅ ARQUIVO 'user_usdc.json' CRIADO COM SUCESSO!");
console.log("📍 Endereço da Conta:", userUsdcAddress.toBase58());
console.log("💰 Saldo: 1.000.000 USDC");
