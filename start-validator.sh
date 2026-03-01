#!/bin/bash
pkill -f solana-test-validator 2>/dev/null
sleep 2
solana-test-validator \
  --url "https://mainnet.helius-rpc.com/?api-key=401bd93f-2675-4caa-aa8b-372fb3f981dc" \
  --reset \
  --clone-upgradeable-program MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA \
  --clone-upgradeable-program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc \
  --clone-upgradeable-program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 \
  --account 2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB /home/vnspo/flash_loan_bot/accounts/usdc_bank.json \
  --account 4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8 /home/vnspo/flash_loan_bot/accounts/marginfi_group.json \
  --account 7jaiZR5Sk8hdYN9MxTpczTcwbWpb5WEoxSANuUwveuat /home/vnspo/flash_loan_bot/accounts/liquidity_vault.json \
  --account A5exmRmrGyQ9DyPFB5v1QzUdRPnk3Sp73ARRoobkQUPu /home/vnspo/flash_loan_bot/accounts/marginfi_account.json \
  --clone EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --clone So11111111111111111111111111111111111111112 \
  --clone HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ \
  --clone A2W6hiA2nf16iqtbZt9vX8FJbiXjv3DBUG3DgTja61HT \
  --clone 2Eh8HEeu45tCWxY6ruLLRN6VcTSD7bfshGj7bZA87Kne \
  --clone CEstjhG1v4nUgvGDyFruYEbJ18X8XeN4sX1WFCLt4D5c \
  --clone 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2 \
  --clone DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz \
  --clone HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz
