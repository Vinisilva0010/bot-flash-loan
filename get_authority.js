const { PublicKey } = require("@solana/web3.js");

// Program ID do Solend Permissionless (Turbo)
const PROGRAM_ID = new PublicKey("So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo");
const MARKET_ADDRESS = new PublicKey("7RCz8wb6WXxUhAigok9ttgrVgDFFFbibcirECzWSBauM");

// Calcula o PDA (Authority)
const [authority] = PublicKey.findProgramAddressSync(
    [MARKET_ADDRESS.toBuffer()],
    PROGRAM_ID
);

console.log("MARKET_AUTHORITY:", authority.toBase58());
