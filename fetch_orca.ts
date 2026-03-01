import { Connection, PublicKey } from "@solana/web3.js";
import { 
    ORCA_WHIRLPOOL_PROGRAM_ID, 
    PDAUtil, 
    TickUtil, 
    ParsableWhirlpool 
} from "@orca-so/whirlpools-sdk";
import * as fs from "fs";

// 1. CONFIGURAÇÕES
const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc";
const connection = new Connection(RPC_URL);

// Endereços
const POOL_ADDRESS = new PublicKey("HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ");
const ORACLE_ADDRESS = new PublicKey("4GkRbcYg1VKsZropgai4dMf2Nj2PkXNLf43knFpavrSi");

async function main() {
  console.log("📡 Conectando ao Radar da Orca (Modo Anti-Falha)...");

  // 1. BAIXAR DADOS DO POOL
  console.log(`🔍 Lendo Pool: ${POOL_ADDRESS.toBase58()}...`);
  const poolInfo = await connection.getAccountInfo(POOL_ADDRESS);
  if (!poolInfo) throw new Error("Pool não encontrado!");

  const poolData = ParsableWhirlpool.parse(POOL_ADDRESS, poolInfo);
  if (!poolData) throw new Error("Falha ao decodificar dados");

  const currentTick = poolData.tickCurrentIndex;
  const tickSpacing = poolData.tickSpacing;
  const vaultA = poolData.tokenVaultA;
  const vaultB = poolData.tokenVaultB;

  console.log(`✅ Preço Atual: ${currentTick}`);
  saveAccountToFile(POOL_ADDRESS, poolInfo, "orca_pool.json");

  // 2. BAIXAR COFRES E ORÁCULO
  await downloadAndSave(vaultA, "orca_vault_a.json");
  await downloadAndSave(vaultB, "orca_vault_b.json");
  await downloadAndSave(ORACLE_ADDRESS, "orca_oracle.json"); // <--- AGORA VAI CRIAR SEMPRE

  // 3. CALCULAR TICKARRAYS
  console.log("\n📍 Calculando endereços de TickArrays...");
  const startTick = TickUtil.getStartTickIndex(currentTick, tickSpacing);
  
  const pdaCurrent = PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, POOL_ADDRESS, startTick);
  const ticksInArray = 88 * tickSpacing;
  const pdaPrev = PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, POOL_ADDRESS, startTick - ticksInArray);
  const pdaNext = PDAUtil.getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, POOL_ADDRESS, startTick + ticksInArray);

  await downloadAndSave(pdaCurrent.publicKey, "orca_tick_current.json");
  await downloadAndSave(pdaPrev.publicKey, "orca_tick_prev.json");
  await downloadAndSave(pdaNext.publicKey, "orca_tick_next.json");

  console.log("\n🎉 SUCESSO! Todos os arquivos garantidos.");
}

async function downloadAndSave(pubkey: PublicKey, filename: string) {
    console.log(`📥 Baixando: ${filename} (${pubkey.toBase58()})...`);
    let info = await connection.getAccountInfo(pubkey);
    
    // CORREÇÃO: SE A CONTA NÃO EXISTE, CRIA UM "MOCK" (FALSO)
    if (!info) {
        console.warn(`⚠️ AVISO: Conta vazia! Criando arquivo MOCK para o validador não quebrar.`);
        info = {
            lamports: 1000000, // Dá um dinheirinho fake pra ela existir
            owner: ORCA_WHIRLPOOL_PROGRAM_ID, // Diz que é da Orca
            data: Buffer.alloc(0), // Dados vazios
            executable: false,
            rentEpoch: 0
        };
    }
    saveAccountToFile(pubkey, info, filename);
}

function saveAccountToFile(pubkey: PublicKey, info: any, filename: string) {
    const accountJson = {
        pubkey: pubkey.toBase58(),
        account: {
            lamports: info.lamports,
            data: [info.data.toString("base64"), "base64"],
            owner: info.owner.toBase58(),
            executable: info.executable,
            rentEpoch: 0 
        }
    };
    fs.writeFileSync(filename, JSON.stringify(accountJson, null, 2));
}

main();
