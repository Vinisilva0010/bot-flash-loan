# ⚡ Bot Flash Loan — Solana (MarginFi + Raydium + Orca)

Bot de **Flash Loan atômico** na blockchain Solana que executa arbitragem entre os protocolos **MarginFi**, **Raydium AMM V4** e **Orca Whirlpool** em uma única transação on-chain.

---

## 🏗️ Arquitetura

```
MarginFi Flash Loan (borrow USDC)
        │
        ▼
Raydium AMM V4  →  Swap USDC → SOL
        │
        ▼
Orca Whirlpool  →  Swap SOL → USDC
        │
        ▼
MarginFi Repay  →  Devolve USDC + fee
        │
        ▼
    💰 Lucro
```

O smart contract Anchor (`programs/flash_loan_bot`) expõe 6 instruções que são compostas em uma transação atômica pelo client TypeScript.

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Smart Contract | Rust + Anchor Framework |
| Client / SDK | TypeScript + @coral-xyz/anchor |
| Flash Loan | MarginFi V2 |
| DEX A (USDC→SOL) | Raydium AMM V4 |
| DEX B (SOL→USDC) | Orca Whirlpool |
| Teste Local | Solana Test Validator |

---

## 📁 Estrutura do Projeto

```
bot-flash-loan/
├── programs/
│   └── flash_loan_bot/
│       └── src/
│           └── lib.rs          # Smart contract principal (Rust/Anchor)
├── scripts/                    # Scripts de execução e setup
├── tests/                      # Testes Anchor (TypeScript)
├── migrations/                 # Deploy scripts
├── accounts/                   # Contas e PDAs geradas
├── Anchor.toml                 # Configuração do Anchor
├── Cargo.toml                  # Dependências Rust
├── package.json                # Dependências Node.js
├── tsconfig.json               # Configuração TypeScript
└── start-validator.sh          # Script para iniciar validador local
```

---

## ⚙️ Pré-requisitos

- [Rust](https://rustup.rs/) `1.79+`
- [Solana CLI](https://docs.solanalabs.com/cli/install) `1.18+`
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) `0.32+`
- [Node.js](https://nodejs.org/) `18+`
- [Yarn](https://yarnpkg.com/)

---

## 🚀 Setup e Deploy

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/Vinisilva0010/bot-flash-loan.git
cd bot-flash-loan
yarn install
```

### 2. Build do smart contract

```bash
anchor build
```

### 3. Iniciar validador local (localnet)

```bash
bash start-validator.sh
```

Este script sobe o `solana-test-validator` com os programas fork do mainnet:
- `orca_whirlpool.so` — Orca Whirlpool Program
- `raydium_v4.so` — Raydium AMM V4
- `solend_program.so` — Solend (referência)

### 4. Deploy na localnet

```bash
anchor deploy
```

### 5. Executar testes

```bash
anchor test --skip-local-validator
```

---

## 🔑 Instruções do Smart Contract

| # | Instrução | Descrição |
|---|-----------|------------|
| 1 | `marginfi_start_flashloan` | Inicia o flash loan no MarginFi |
| 2 | `marginfi_borrow` | Toma emprestado USDC |
| 3 | `proxy_raydium` | Swap USDC → SOL via Raydium AMM V4 |
| 4 | `proxy_orca` | Swap SOL → USDC via Orca Whirlpool |
| 5 | `marginfi_repay` | Repaga o empréstimo |
| 6 | `marginfi_end_flashloan` | Finaliza o flash loan |

---

## 🛡️ Proteções On-Chain

- **Slippage check**: reverte se o output for menor que `amount_out_min`
- **Profit check**: garante que USDC final ≥ USDC inicial + fees
- **Arithmetic overflow**: usa `checked_sub` / `checked_add` em todos os cálculos

---

## 📦 Programas Externos (fork local)

| Arquivo | Programa |
|---------|----------|
| `orca_whirlpool.so` | Orca Whirlpool (mainnet fork) |
| `raydium_v4.so` | Raydium AMM V4 (mainnet fork) |
| `solend_program.so` | Solend Protocol (mainnet fork) |

---

## ⚠️ Aviso

Este repositório é um projeto de **estudo e desenvolvimento pessoal**. Use por sua conta e risco. Flash loans em mainnet envolvem riscos financeiros reais. Sempre teste extensivamente em localnet/devnet antes de qualquer deploy em produção.

---

## 👨‍💻 Autor

**Vinicius da Silva Pontual**  
[@Vinisilva0010](https://github.com/Vinisilva0010)

---

## 📄 Licença

ISC — veja `package.json`
