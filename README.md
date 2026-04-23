#  Solana Flash Loan Arbitrage Bot (MarginFi + Raydium + Orca)

Production‑grade Solana flash loan bot that executes **atomic arbitrage** between **MarginFi V2**, **Raydium AMM V4**, and **Orca Whirlpool** in a single transaction. The entire lifecycle — borrow, route through DEXes, repay, and profit check — is enforced on‑chain by an Anchor program.

> Flash loan capital comes from MarginFi, first leg swap runs on Raydium (USDC → SOL), second leg swap runs on Orca Whirlpool (SOL → USDC), and the final state is validated on‑chain before the loan is closed. [web:81]

---

## Overview

This project is not a “hello world” flash loan example. It is a full stack arbitrage engine with:

- A **Rust + Anchor** smart contract that orchestrates the entire flash loan pipeline via low‑level CPIs into MarginFi, Raydium, and Orca.
- A set of **TypeScript / JavaScript scripts** that discover on‑chain accounts (pools, vaults, ticks, MarginFi banks) and write them into JSONs consumed by the program. [web:81]
- A **local mainnet‑like environment** (Solana test validator + forked `.so` programs for Raydium V4, Orca Whirlpool and Solend) so you can simulate realistic liquidity and prices before going anywhere near mainnet. [web:81]

The result is a flash loan bot that you can actually extend and operate, not just compile.

---

## Architecture

High‑level arbitrage path:

```text
MarginFi Flash Loan (borrow USDC)
        │
        ▼
  Raydium AMM V4   →  Swap USDC → SOL
        │
        ▼
  Orca Whirlpool   →  Swap SOL → USDC
        │
        ▼
  MarginFi Repay   →  Repay USDC + fees
        │
        ▼
         Profit (if any)
```

The Anchor program `flash_loan_bot` exposes **six instructions** that are composed into a single atomic transaction by an off‑chain client:

1. `marginfi_start_flashloan` – opens the flash loan scope inside MarginFi.
2. `marginfi_borrow` – borrows USDC into the bot’s token account.
3. `proxy_raydium` – performs the USDC → SOL swap through Raydium AMM V4 + Serum.
4. `proxy_orca` – performs the SOL → USDC swap through Orca Whirlpool.
5. `marginfi_repay` – repays the borrowed USDC back to MarginFi.
6. `marginfi_end_flashloan` – closes the flash loan and finalizes the cycle. [web:81]

Every step is guarded with on‑chain checks (slippage, overflow, profit invariants). If any condition fails, **the whole transaction reverts** and no capital is lost.

---

## Key Techniques

**1. Low‑level CPIs with manual discriminators**  
Instead of relying on heavy SDKs, the program builds `Instruction` objects by hand and calls external programs via `invoke`, using pre‑computed sighashes such as `sha256("global:lending_account_borrow")[0..8]` for MarginFi methods. This makes the integration explicit, debuggable, and robust to SDK changes. [web:81]  

**2. Exact account wiring for Raydium AMM V4**  
`proxy_raydium` wires all Raydium + Serum accounts explicitly: AMM ID, authority, open orders, target orders, coin/pc vaults, Serum market, bids/asks, event queue, vaults, and vault signer. The program measures token balances before and after the CPI to calculate the real received amount on‑chain. [web:81]  

**3. Native Whirlpool integration**  
`proxy_orca` integrates directly with Orca Whirlpool’s `swap` instruction, including the correct 8‑byte discriminator, price limit (`min_sqrt_price`), and direction flags (`amount_specified_is_input`, `a_to_b`). It also passes all required Whirlpool accounts: pool, owner token accounts, vaults, tick arrays and oracle. [web:81]  

**4. On‑chain slippage & profit validation**  
Both DEX proxies compute balances before and after swaps using SPL token accessors, then enforce:

- `received >= amount_out_min` (slippage guard)
- checked integer arithmetic (`checked_add`, `checked_sub`) to prevent overflows
- explicit error codes like `SlippageExceeded`, `NegativeProfit`, `ArithmeticOverflow` for auditability. [web:81]

This moves critical risk logic from off‑chain bots into the contract itself.

**5. Strong local environment**  
The repository ships with:

- `orca_whirlpool.so` – fork of Orca Whirlpool program
- `raydium_v4.so` – Raydium AMM V4 program
- `solend_program.so` – Solend program

and a `start-validator.sh` to boot a local test validator that loads those programs, mimicking mainnet behavior for liquidity and routing. [web:81]

---

## Tech Stack

| Layer            | Technology                             |
|------------------|----------------------------------------|
| Smart contract   | Rust + Anchor Framework                |
| Off‑chain client | TypeScript + `@coral-xyz/anchor`       |
| Lending          | MarginFi V2                            |
| DEX A (leg 1)    | Raydium AMM V4 + Serum                 |
| DEX B (leg 2)    | Orca Whirlpool                         |
| Chain            | Solana                                |
| Local testing    | `solana-test-validator` + local `.so`  | [web:81]

---

## Project Structure

```text
bot-flash-loan/
├── programs/
│   └── flash_loan_bot/
│       └── src/
│           └── lib.rs          # Main Anchor program: flash loan pipeline
├── marginfi-v2/                # Embedded MarginFi V2 code + audits and crates
├── accounts/                   # JSONs with discovered accounts (banks, pools, vaults, ticks)
├── scripts/                    # Discovery + setup scripts (pools, vaults, ticks, etc.)
├── tests/                      # Anchor tests (TypeScript)
├── migrations/                 # Deploy scripts
├── orca_whirlpool.so           # Orca Whirlpool (mainnet fork for localnet)
├── raydium_v4.so               # Raydium AMM V4 (mainnet fork for localnet)
├── solend_program.so           # Solend Program (reference / extra)
├── Anchor.toml                 # Anchor workspace configuration
├── Cargo.toml                  # Rust dependencies
├── package.json                # Node.js/TypeScript dependencies
├── tsconfig.json               # TypeScript configuration
└── start-validator.sh          # Local validator bootstrap script
```
[web:81]

---

## Getting Started

### 1. Prerequisites

- Rust `1.79+`
- Solana CLI `1.18+`
- Anchor CLI `0.32+`
- Node.js `18+`
- Yarn

Install system tools following the official docs:

- https://rustup.rs/  
- https://docs.solanalabs.com/cli/install  
- https://www.anchor-lang.com/docs/installation  

### 2. Clone and install dependencies

```bash
git clone https://github.com/Vinisilva0010/bot-flash-loan.git
cd bot-flash-loan
yarn install
```
[web:81]

### 3. Build the smart contract

```bash
anchor build
```

### 4. Start a local validator with external programs

```bash
bash start-validator.sh
```

This script launches a `solana-test-validator` and loads the forked `.so` programs (Orca, Raydium, Solend) so that swaps and MarginFi calls behave similarly to mainnet when you use the supplied accounts. [web:81]

### 5. Deploy to localnet

```bash
anchor deploy
```

### 6. Run tests

```bash
anchor test --skip-local-validator
```

Anchor will reuse the already running local validator instead of spawning a new one.

---

## How the Flash Loan Cycle Works

A typical off‑chain flow (TypeScript client) looks like:

1. **Discover pools & accounts** using the scripts in `scripts/` and write results into the JSONs under `accounts/`.  
2. **Select a route and amount** based on your own arbitrage strategy (e.g., Raydium USDC/SOL pool A + Orca SOL/USDC pool B).  
3. **Compose a single transaction** that calls the six Anchor instructions in order:

   - `marginfi_start_flashloan`
   - `marginfi_borrow`
   - `proxy_raydium`
   - `proxy_orca`
   - `marginfi_repay`
   - `marginfi_end_flashloan`

4. **Submit the transaction** and wait for confirmation. If at any point the received amount is not enough to repay principal + fees or slippage exceeds your thresholds, the transaction fails and no funds move. [web:81]

The on‑chain program is stateless with respect to strategy logic — you are free to plug in any off‑chain search/optimization engine as long as it respects the invariants enforced by the contract.

---

## On‑Chain Safety & Risk Controls

The contract is designed with a “safety‑first” philosophy:

- **Slippage protection** – every swap checks `received >= amount_out_min` and aborts if that condition is violated.
- **Profit guard** – the intent is that the post‑Orca USDC balance must be enough to repay MarginFi plus any relevant fees; if not, the transaction should not proceed.
- **Checked arithmetic** – all sensitive arithmetic uses Rust `checked_*` operations, raising `ArithmeticOverflow` if something unexpected happens.
- **Explicit error codes** – custom errors (`NegativeProfit`, `SlippageExceeded`, etc.) make it easier to monitor, alert, and audit behavior in production. [web:81]

Combined with the atomicity of Solana transactions, this greatly reduces the risk of partial execution or silent loss of funds.

---

## Status and Intended Use

This repository is a **personal R&D project** and a near‑production implementation of a Solana flash loan arbitrage engine. It is meant to be:

- A reference implementation of MarginFi + Raydium + Orca integration.
- A solid starting point for building a proprietary arbitrage stack.
- A showcase of low‑level Solana DeFi integration using Anchor. [web:81]

> Use at your own risk. Always test thoroughly on localnet/devnet before considering any mainnet deployment.

---

## Author

**Vinícius da Silva Pontual**  
GitHub: [@Vinisilva0010](https://github.com/Vinisilva0010)

---

## License

This project is licensed under the ISC license (see `package.json` for details). [web:81]
