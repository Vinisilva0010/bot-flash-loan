import sys
import json

try:
    # Lê o JSON vindo do curl
    raw_data = sys.stdin.read()
    if not raw_data:
        print("❌ Erro: API retornou vazio.")
        sys.exit(1)
        
    data = json.loads(raw_data)

    # Normaliza: Se for dicionário, tenta achar a lista de mercados lá dentro
    markets = []
    if isinstance(data, list):
        markets = data
    elif isinstance(data, dict):
        # Tenta chaves comuns onde a lista pode estar escondida
        for key in ['markets', 'config', 'results', 'data']:
            if key in data and isinstance(data[key], list):
                markets = data[key]
                break
        # Se ainda não achou, talvez o dicionário seja { "nome_mercado": dados }
        if not markets:
            print(f"⚠️  Estrutura desconhecida. Chaves encontradas: {list(data.keys())}")
            # Tenta converter valores do dict em lista
            markets = list(data.values())

    # Procura o Mercado Turbo
    turbo_address = '7RCz8wb6WXxUhAigok9ttgrVgDFFFbibcirECzWSBauM'
    target_market = None
    
    for m in markets:
        # Verifica se o item é um dicionário válido e tem endereço
        if isinstance(m, dict) and m.get('address') == turbo_address:
            target_market = m
            break
            
    if not target_market:
        print(f"❌ Mercado Turbo ({turbo_address}) não encontrado na resposta da API.")
        sys.exit(1)

    # Procura a Reserva USDC dentro do Mercado
    usdc_reserve = None
    reserves = target_market.get('reserves', [])
    
    for r in reserves:
        # A estrutura da reserva pode variar (config.symbol ou apenas symbol)
        config = r.get('config', r)
        if config.get('symbol') == 'USDC':
            usdc_reserve = r
            break
    
    if not usdc_reserve:
        print("❌ Reserva USDC não encontrada neste mercado.")
        sys.exit(1)

    # Extrai os dados finais
    r_config = usdc_reserve.get('config', usdc_reserve)
    
    print("\n✅ SUCESSO! Copie estes endereços:")
    print("-" * 50)
    print(f"const SOLEND_MARKET = '{target_market.get('address')}';")
    print(f"const SOLEND_MARKET_AUTHORITY = '{target_market.get('authorityAddress')}';")
    print(f"const USDC_RESERVE = '{r_config.get('address')}';")
    print(f"const USDC_SOURCE_LIQUIDITY = '{r_config.get('liquidityAddress')}';")
    print("-" * 50)

except json.JSONDecodeError:
    print("❌ Erro: A API não retornou um JSON válido. Provavelmente bloqueio (Cloudflare).")
    print(f"Conteúdo recebido: {raw_data[:100]}...")
except Exception as e:
    print(f"❌ Erro inesperado: {str(e)}")
