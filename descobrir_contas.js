const { Connection, PublicKey } = require("@solana/web3.js");

(async () => {
    // Usando seu RPC da Helius
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc");
    
    // A Reserva de USDC que já clonamos
    const USDC_RESERVE = new PublicKey("BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw");
    
    console.log("🔍 Lendo dados da Reserva USDC...");
    const accountInfo = await connection.getAccountInfo(USDC_RESERVE);
    
    if (!accountInfo) {
        console.log("❌ Erro: Não consegui ler a reserva da Mainnet.");
        return;
    }

    const data = accountInfo.data;
    
    // Função auxiliar para ler Pubkey dos dados brutos
    // Estrutura da Reserve do Solend (aproximada):
    // version: 1
    // last_update: 8
    // lending_market: 32 (offset 10)
    // liquidity: ...
    //   mint: 32 (offset 42)
    //   mint_decimals: 1
    //   supply_pubkey: 32 (offset 75)
    //   ...
    //   fee_receiver: 32 (offset 171) <--- ESSE É O CARA!

    const readPubkey = (offset) => new PublicKey(data.slice(offset, offset + 32));

    console.log("------------------------------------------------");
    console.log("🏥 CHECKUP DA RESERVA USDC (SOLEND MAIN POOL)");
    console.log("------------------------------------------------");
    console.log(`1. Market:              ${readPubkey(10).toBase58()}`);
    console.log(`2. Liquidity Mint:      ${readPubkey(42).toBase58()}`);
    console.log(`3. Liquidity Supply:    ${readPubkey(75).toBase58()} (Nós clonamos este: 8She...)`);
    console.log(`4. FEE RECEIVER:        ${readPubkey(171).toBase58()} <--- FALTANDO!`);
    console.log(`5. Collateral Mint:     ${readPubkey(235).toBase58()}`);
    console.log(`6. Collateral Supply:   ${readPubkey(267).toBase58()}`);
    console.log("------------------------------------------------");
})();

