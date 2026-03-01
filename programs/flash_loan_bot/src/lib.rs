use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use anchor_spl::token::accessor::amount as get_amount;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};

declare_id!("J81fbgoPhVbPr3Vd99f1mtRh5wsxq9Jpf3MynJ8sBCos");

#[error_code]
pub enum FlashLoanError {
    #[msg("Lucro insuficiente para cobrir repay + fees")]
    NegativeProfit,
    #[msg("Slippage excedido")]
    SlippageExceeded,
    #[msg("Overflow aritmético")]
    ArithmeticOverflow,
}

#[program]
pub mod flash_loan_bot {
    use super::*;

    // -----------------------------------------------------------------------
    // 1. MARGINFI START FLASHLOAN
    //    Sighash: sha256("global:lending_account_start_flashloan")[0..8]
    //    Contas:
    //      0. marginfi_account  (mut)
    //      1. signer            (signer)
    //      2. ixs_sysvar        (readonly)
    //    Params: end_index: u64
    // -----------------------------------------------------------------------
    pub fn marginfi_start_flashloan(
        ctx: Context<MarginfiFlashloanBounds>,
        end_index: u64,
    ) -> Result<()> {
        msg!("⚡ [MARGINFI] Iniciando Flash Loan — end_index: {}", end_index);


let sighash: [u8; 8] = [14, 131, 33, 220, 81, 186, 180, 107];
        let mut data = Vec::with_capacity(16);
        data.extend_from_slice(&sighash);
        data.extend_from_slice(&end_index.to_le_bytes());

        let accounts = vec![
            AccountMeta::new(ctx.accounts.marginfi_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.signer.key(), true),
            AccountMeta::new_readonly(ctx.accounts.ixs_sysvar.key(), false),
        ];

        invoke(
            &Instruction {
                program_id: ctx.accounts.marginfi_program.key(),
                accounts,
                data,
            },
            &[
                ctx.accounts.marginfi_account.to_account_info(),
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.ixs_sysvar.to_account_info(),
            ],
        )?;

        msg!("✅ Flash Loan iniciado!");
        Ok(())
    }

    // -----------------------------------------------------------------------
    // 2. MARGINFI BORROW
    //    Sighash: sha256("global:lending_account_borrow")[0..8]
    //    Contas:
    //      0. marginfi_group               (readonly)
    //      1. marginfi_account             (mut)
    //      2. signer                       (signer)
    //      3. bank                         (mut)
    //      4. destination_token_account    (mut)
    //      5. bank_liquidity_vault_authority (readonly, PDA)
    //      6. bank_liquidity_vault         (mut, PDA)
    //      7. token_program                (readonly)
    //    Params: amount: u64
    // -----------------------------------------------------------------------
    pub fn marginfi_borrow(
        ctx: Context<MarginfiBorrow>,
        amount: u64,
    ) -> Result<()> {
        msg!("🏦 [MARGINFI] Tomando emprestado {} unidades...", amount);

        let sighash: [u8; 8] = [4, 126, 116, 53, 48, 5, 212, 31];
        let mut data = Vec::with_capacity(16);
        data.extend_from_slice(&sighash);
        data.extend_from_slice(&amount.to_le_bytes());

        let accounts = vec![
            AccountMeta::new_readonly(ctx.accounts.marginfi_group.key(), false),
            AccountMeta::new(ctx.accounts.marginfi_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.signer.key(), true),
            AccountMeta::new(ctx.accounts.bank.key(), false),
            AccountMeta::new(ctx.accounts.destination_token_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.bank_liquidity_vault_authority.key(), false),
            AccountMeta::new(ctx.accounts.bank_liquidity_vault.key(), false),
            AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        ];

        invoke(
            &Instruction {
                program_id: ctx.accounts.marginfi_program.key(),
                accounts,
                data,
            },
            &[
                ctx.accounts.marginfi_group.to_account_info(),
                ctx.accounts.marginfi_account.to_account_info(),
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.bank.to_account_info(),
                ctx.accounts.destination_token_account.to_account_info(),
                ctx.accounts.bank_liquidity_vault_authority.to_account_info(),
                ctx.accounts.bank_liquidity_vault.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        msg!("✅ Empréstimo recebido!");
        Ok(())
    }

    // -----------------------------------------------------------------------
    // 3. PROXY RAYDIUM AMM V4 — USDC → SOL
    // -----------------------------------------------------------------------
    pub fn proxy_raydium(
        ctx: Context<ProxyRaydium>,
        amount_in: u64,
        amount_out_min: u64,
    ) -> Result<()> {
        msg!("🌊 [RAYDIUM] Swap {} USDC → SOL...", amount_in);

        let balance_before = get_amount(&ctx.accounts.destination_token_account)?;

        let mut data = Vec::with_capacity(17);
        data.push(9u8);
        data.extend_from_slice(&amount_in.to_le_bytes());
        data.extend_from_slice(&amount_out_min.to_le_bytes());

        let accounts = vec![
            AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
            AccountMeta::new(ctx.accounts.amm_id.key(), false),
            AccountMeta::new_readonly(ctx.accounts.amm_authority.key(), false),
            AccountMeta::new(ctx.accounts.amm_open_orders.key(), false),
            AccountMeta::new(ctx.accounts.amm_target_orders.key(), false),
            AccountMeta::new(ctx.accounts.amm_coin_vault.key(), false),
            AccountMeta::new(ctx.accounts.amm_pc_vault.key(), false),
            AccountMeta::new_readonly(ctx.accounts.serum_program.key(), false),
            AccountMeta::new(ctx.accounts.serum_market.key(), false),
            AccountMeta::new(ctx.accounts.serum_bids.key(), false),
            AccountMeta::new(ctx.accounts.serum_asks.key(), false),
            AccountMeta::new(ctx.accounts.serum_event_queue.key(), false),
            AccountMeta::new(ctx.accounts.serum_coin_vault.key(), false),
            AccountMeta::new(ctx.accounts.serum_pc_vault.key(), false),
            AccountMeta::new_readonly(ctx.accounts.serum_vault_signer.key(), false),
            AccountMeta::new(ctx.accounts.user_token_account.key(), false),
            AccountMeta::new(ctx.accounts.destination_token_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.user.key(), true),
        ];

        invoke(
            &Instruction {
                program_id: ctx.accounts.raydium_program.key(),
                accounts,
                data,
            },
            &[
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.amm_id.to_account_info(),
                ctx.accounts.amm_authority.to_account_info(),
                ctx.accounts.amm_open_orders.to_account_info(),
                ctx.accounts.amm_target_orders.to_account_info(),
                ctx.accounts.amm_coin_vault.to_account_info(),
                ctx.accounts.amm_pc_vault.to_account_info(),
                ctx.accounts.serum_program.to_account_info(),
                ctx.accounts.serum_market.to_account_info(),
                ctx.accounts.serum_bids.to_account_info(),
                ctx.accounts.serum_asks.to_account_info(),
                ctx.accounts.serum_event_queue.to_account_info(),
                ctx.accounts.serum_coin_vault.to_account_info(),
                ctx.accounts.serum_pc_vault.to_account_info(),
                ctx.accounts.serum_vault_signer.to_account_info(),
                ctx.accounts.user_token_account.to_account_info(),
                ctx.accounts.destination_token_account.to_account_info(),
                ctx.accounts.user.to_account_info(),
            ],
        )?;

        let balance_after = get_amount(&ctx.accounts.destination_token_account)?;
        let received = balance_after
            .checked_sub(balance_before)
            .ok_or(FlashLoanError::ArithmeticOverflow)?;

        require!(received >= amount_out_min, FlashLoanError::SlippageExceeded);

        msg!("✅ Raydium OK — recebeu {} SOL", received);
        Ok(())
    }

    // -----------------------------------------------------------------------
    // 4. PROXY ORCA WHIRLPOOL — SOL → USDC
    // -----------------------------------------------------------------------


      // --- 4. PROXY ORCA WHIRLPOOL — SOL → USDC ---
    pub fn proxy_orca(
        ctx: Context<ProxyOrca>,
        amount_in: u64,
        amount_out_min: u64,
    ) -> Result<()> {
        msg!("🐳 [ORCA] Swap {} SOL → USDC...", amount_in);

        let usdc_before = get_amount(&ctx.accounts.token_owner_account_b)?;

        // ✅ DISCRIMINADOR CORRETO — sha256("global:swap")[0..8]
        let discriminator: [u8; 8] = [0xf8, 0xc6, 0x9e, 0x91, 0xe1, 0x75, 0x87, 0xc8];
        
        let mut data = Vec::with_capacity(43);
        data.extend_from_slice(&discriminator);
        data.extend_from_slice(&amount_in.to_le_bytes());
        data.extend_from_slice(&amount_out_min.to_le_bytes());
        
        // ✅ LIMITE DE PREÇO CORRETO PARA a_to_b = true
        let min_sqrt_price: u128 = 4295048016;
        data.extend_from_slice(&min_sqrt_price.to_le_bytes());
        
        data.push(1u8); // amount_specified_is_input = true
        data.push(1u8); // ✅ a_to_b = true (SOL -> USDC)

        let accounts = vec![
            AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
            AccountMeta::new_readonly(ctx.accounts.token_authority.key(), true),
            AccountMeta::new(ctx.accounts.whirlpool.key(), false),
            AccountMeta::new(ctx.accounts.token_owner_account_a.key(), false),
            AccountMeta::new(ctx.accounts.token_vault_a.key(), false),
            AccountMeta::new(ctx.accounts.token_owner_account_b.key(), false),
            AccountMeta::new(ctx.accounts.token_vault_b.key(), false),
            AccountMeta::new(ctx.accounts.tick_array_0.key(), false),
            AccountMeta::new(ctx.accounts.tick_array_1.key(), false),
            AccountMeta::new(ctx.accounts.tick_array_2.key(), false),
            AccountMeta::new(ctx.accounts.oracle.key(), false), // ✅ AGORA É WRITABLE
        ];

        invoke(
            &Instruction {
                program_id: ctx.accounts.whirlpool_program.key(),
                accounts,
                data,
            },
            &[
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.token_authority.to_account_info(),
                ctx.accounts.whirlpool.to_account_info(),
                ctx.accounts.token_owner_account_a.to_account_info(),
                ctx.accounts.token_vault_a.to_account_info(),
                ctx.accounts.token_owner_account_b.to_account_info(),
                ctx.accounts.token_vault_b.to_account_info(),
                ctx.accounts.tick_array_0.to_account_info(),
                ctx.accounts.tick_array_1.to_account_info(),
                ctx.accounts.tick_array_2.to_account_info(),
                ctx.accounts.oracle.to_account_info(),
            ],
        )?;

        let usdc_after = get_amount(&ctx.accounts.token_owner_account_b)?;
        let received = usdc_after
            .checked_sub(usdc_before)
            .ok_or(FlashLoanError::ArithmeticOverflow)?;

        require!(received >= amount_out_min, FlashLoanError::SlippageExceeded);

        msg!("✅ Orca OK — recebeu {} USDC", received);
        Ok(())
    }

      
   








    // -----------------------------------------------------------------------
    // 5. MARGINFI REPAY
    //    Sighash: sha256("global:lending_account_repay")[0..8]
    //    Contas:
    //      0. marginfi_group           (readonly)
    //      1. marginfi_account         (mut)
    //      2. signer                   (signer)
    //      3. bank                     (mut)
    //      4. signer_token_account     (mut)
    //      5. bank_liquidity_vault     (mut, PDA)
    //      6. token_program            (readonly)
    //    Params: amount: u64, repay_all: Option<bool>
    // -----------------------------------------------------------------------
    pub fn marginfi_repay(
        ctx: Context<MarginfiRepay>,
        amount: u64,
        repay_all: bool,
    ) -> Result<()> {
        msg!("💸 [MARGINFI] Repagando {}...", amount);

        let sighash: [u8; 8] = [79, 209, 172, 177, 222, 51, 173, 151];
        let mut data = Vec::with_capacity(17);
        data.extend_from_slice(&sighash);
        data.extend_from_slice(&amount.to_le_bytes());
        // Option<bool>: None=0x00, Some(false)=0x01 0x00, Some(true)=0x01 0x01
        if repay_all {
            data.extend_from_slice(&[1u8, 1u8]);
        } else {
            data.push(0u8);
        }

        let accounts = vec![
            AccountMeta::new_readonly(ctx.accounts.marginfi_group.key(), false),
            AccountMeta::new(ctx.accounts.marginfi_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.signer.key(), true),
            AccountMeta::new(ctx.accounts.bank.key(), false),
            AccountMeta::new(ctx.accounts.signer_token_account.key(), false),
            AccountMeta::new(ctx.accounts.bank_liquidity_vault.key(), false),
            AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        ];

        invoke(
            &Instruction {
                program_id: ctx.accounts.marginfi_program.key(),
                accounts,
                data,
            },
            &[
                ctx.accounts.marginfi_group.to_account_info(),
                ctx.accounts.marginfi_account.to_account_info(),
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.bank.to_account_info(),
                ctx.accounts.signer_token_account.to_account_info(),
                ctx.accounts.bank_liquidity_vault.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        msg!("✅ Repay concluído!");
        Ok(())
    }

    // -----------------------------------------------------------------------
    // 6. MARGINFI END FLASHLOAN
    //    Sighash: sha256("global:lending_account_end_flashloan")[0..8]
    //    Contas:
    //      0. marginfi_account  (mut)
    //      1. signer            (signer)
    //    Sem params adicionais
    // -----------------------------------------------------------------------
    pub fn marginfi_end_flashloan(
        ctx: Context<MarginfiFlashloanBounds>,
    ) -> Result<()> {
        msg!("🔒 [MARGINFI] Encerrando Flash Loan...");

        let sighash: [u8; 8] = [105, 124, 201, 106, 153, 2, 8, 156];
        let mut data = Vec::with_capacity(8);
        data.extend_from_slice(&sighash);

        let accounts = vec![
            AccountMeta::new(ctx.accounts.marginfi_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.signer.key(), true),
            // ixs_sysvar não é necessário no end
        ];

        invoke(
            &Instruction {
                program_id: ctx.accounts.marginfi_program.key(),
                accounts,
                data,
            },
            &[
                ctx.accounts.marginfi_account.to_account_info(),
                ctx.accounts.signer.to_account_info(),
            ],
        )?;

        msg!("✅ Flash Loan encerrado!");
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// STRUCTS DE CONTAS
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct MarginfiFlashloanBounds<'info> {
    /// CHECK: MarginfiAccount do usuário
    #[account(mut)]
    pub marginfi_account: UncheckedAccount<'info>,
    pub signer: Signer<'info>,
    /// CHECK: Marginfi Program
    pub marginfi_program: UncheckedAccount<'info>,
    /// CHECK: Instructions Sysvar
    pub ixs_sysvar: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct MarginfiBorrow<'info> {
    /// CHECK: MarginfiGroup
    pub marginfi_group: UncheckedAccount<'info>,
    /// CHECK: MarginfiAccount
    #[account(mut)]
    pub marginfi_account: UncheckedAccount<'info>,
    pub signer: Signer<'info>,
    /// CHECK: Bank USDC
    #[account(mut)]
    pub bank: UncheckedAccount<'info>,
    /// CHECK: Conta USDC do usuário (destino)
    #[account(mut)]
    pub destination_token_account: UncheckedAccount<'info>,
    /// CHECK: PDA — seeds: ["liquidity_vault_auth", bank.key()]
    pub bank_liquidity_vault_authority: UncheckedAccount<'info>,
    /// CHECK: PDA — seeds: ["liquidity_vault", bank.key()]
    #[account(mut)]
    pub bank_liquidity_vault: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: Marginfi Program
    pub marginfi_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct MarginfiRepay<'info> {
    /// CHECK: MarginfiGroup
    pub marginfi_group: UncheckedAccount<'info>,
    /// CHECK: MarginfiAccount
    #[account(mut)]
    pub marginfi_account: UncheckedAccount<'info>,
    pub signer: Signer<'info>,
    /// CHECK: Bank USDC
    #[account(mut)]
    pub bank: UncheckedAccount<'info>,
    /// CHECK: Conta USDC do usuário (origem do repay)
    #[account(mut)]
    pub signer_token_account: UncheckedAccount<'info>,
    /// CHECK: PDA — seeds: ["liquidity_vault", bank.key()]
    #[account(mut)]
    pub bank_liquidity_vault: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: Marginfi Program
    pub marginfi_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ProxyRaydium<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: USDC de entrada
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,
    /// CHECK: SOL de saída
    #[account(mut)]
    pub destination_token_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: Raydium AMM Program
    pub raydium_program: UncheckedAccount<'info>,
    /// CHECK: AMM ID
    #[account(mut)]
    pub amm_id: UncheckedAccount<'info>,
    /// CHECK: AMM Authority
    pub amm_authority: UncheckedAccount<'info>,
    /// CHECK: AMM Open Orders
    #[account(mut)]
    pub amm_open_orders: UncheckedAccount<'info>,
    /// CHECK: AMM Target Orders
    #[account(mut)]
    pub amm_target_orders: UncheckedAccount<'info>,
    /// CHECK: AMM Coin Vault
    #[account(mut)]
    pub amm_coin_vault: UncheckedAccount<'info>,
    /// CHECK: AMM PC Vault
    #[account(mut)]
    pub amm_pc_vault: UncheckedAccount<'info>,
    /// CHECK: Serum Program
    pub serum_program: UncheckedAccount<'info>,
    /// CHECK: Serum Market
    #[account(mut)]
    pub serum_market: UncheckedAccount<'info>,
    /// CHECK: Serum Bids
    #[account(mut)]
    pub serum_bids: UncheckedAccount<'info>,
    /// CHECK: Serum Asks
    #[account(mut)]
    pub serum_asks: UncheckedAccount<'info>,
    /// CHECK: Serum Event Queue
    #[account(mut)]
    pub serum_event_queue: UncheckedAccount<'info>,
    /// CHECK: Serum Coin Vault
    #[account(mut)]
    pub serum_coin_vault: UncheckedAccount<'info>,
    /// CHECK: Serum PC Vault
    #[account(mut)]
    pub serum_pc_vault: UncheckedAccount<'info>,
    /// CHECK: Serum Vault Signer
    pub serum_vault_signer: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ProxyOrca<'info> {
    pub token_program: Program<'info, Token>,
    pub token_authority: Signer<'info>,
    /// CHECK: Orca Whirlpool Program
    pub whirlpool_program: UncheckedAccount<'info>,
    /// CHECK: Pool
    #[account(mut)]
    pub whirlpool: UncheckedAccount<'info>,
    /// CHECK: SOL de entrada (A)
    #[account(mut)]
    pub token_owner_account_a: UncheckedAccount<'info>,
    /// CHECK: Vault A
    #[account(mut)]
    pub token_vault_a: UncheckedAccount<'info>,
    /// CHECK: USDC de saída (B)
    #[account(mut)]
    pub token_owner_account_b: UncheckedAccount<'info>,
    /// CHECK: Vault B
    #[account(mut)]
    pub token_vault_b: UncheckedAccount<'info>,
    /// CHECK: Tick Array 0
    #[account(mut)]
    pub tick_array_0: UncheckedAccount<'info>,
    /// CHECK: Tick Array 1
    #[account(mut)]
    pub tick_array_1: UncheckedAccount<'info>,
    /// CHECK: Tick Array 2
    #[account(mut)]
    pub tick_array_2: UncheckedAccount<'info>,
    /// CHECK: Oracle — writable para pools AdaptiveFee
    #[account(mut)]
    pub oracle: UncheckedAccount<'info>,
}
