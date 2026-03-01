const { Connection, PublicKey } = require("@solana/web3.js");

(async () => {
    try {
        console.log("🌐 Conectando no RPC Oficial (Bypass do SDK falho)...");
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

        // O endereço da Reserva de USDC do Main Pool
        const usdcReserveAddress = new PublicKey("BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw");

        console.log("📥 Puxando os bytes brutos da blockchain...");
        const accountInfo = await connection.getAccountInfo(usdcReserveAddress);

        if (!accountInfo) {
            console.log("❌ Erro: Conta não encontrada on-chain.");
            return;
        }

        const data = accountInfo.data;

        // ESTRUTURA DO RESERVE DO SOLEND EM BYTES:
        // A struct de configuração começa no byte 105.
        // O feeReceiver está no offset 254 dessa configuração.
        // Logo, 105 + 254 = 359. A Public Key tem 32 bytes (359 a 391).
        
        // Vamos extrair as PublicKeys vitais cortando o Buffer na mão (Hack level 100)
        
        // 1. Lending Market (Offset 10, tamanho 32)
        const marketPubkey = new PublicKey(data.subarray(10, 42));
        
        // 2. Liquidity Supply (O Cofre - Offset 42, tamanho 32)
        const liquiditySupplyPubkey = new PublicKey(data.subarray(42, 74));
        
        // 3. Fee Receiver (O Caixa das Taxas - Offset 359, tamanho 32)
        const feeReceiverPubkey = new PublicKey(data.subarray(359, 391));

        // 4. Pyth Oracle (Offset 175, tamanho 32)
        const pythOraclePubkey = new PublicKey(data.subarray(175, 207));

        console.log("\n═══════════════════════════════════════════════════");
        console.log("✅ A VERDADE ABSOLUTA (Parsed na mão via Web3.js)");
        console.log("═══════════════════════════════════════════════════");
        
        console.log(`1. MARKET ADDRESS:       ${marketPubkey.toBase58()}`);
        console.log(`2. USDC RESERVE:         ${usdcReserveAddress.toBase58()}`);
        console.log(`3. LIQUIDITY SUPPLY:     ${liquiditySupplyPubkey.toBase58()} (O Cofre)`);
        
        // A PEÇA QUE FALTAVA
        console.log(`4. FEE RECEIVER:         ${feeReceiverPubkey.toBase58()} (O Caixa)`);
        
        console.log(`5. PYTH ORACLE:          ${pythOraclePubkey.toBase58()}`);
        
        console.log("═══════════════════════════════════════════════════");

    } catch (e) {
        console.error("❌ Deu erro na execução:", e);
    }
})();
