export const TOKEN_MAP = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    color: '#2775CA',
    stable: true,
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    color: '#50AF95',
    stable: true,
  },
  So11111111111111111111111111111111111111112: {
    symbol: 'wSOL',
    name: 'Wrapped SOL',
    decimals: 9,
    color: '#9945FF',
    priceKey: 'SOL',
  },
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: {
    symbol: 'JitoSOL',
    name: 'Jito Staked SOL',
    decimals: 9,
    color: '#8BC34A',
  },
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: {
    symbol: 'mSOL',
    name: 'Marinade SOL',
    decimals: 9,
    color: '#4DB6AC',
  },
  bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1: {
    symbol: 'bSOL',
    name: 'BlazeStaked SOL',
    decimals: 9,
    color: '#FF6D00',
    priceKey: 'SOL',
  },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    color: '#F5A623',
  },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': {
    symbol: 'ETH',
    name: 'Ether (Wormhole)',
    decimals: 8,
    color: '#627EEA',
  },
  cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij: {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
    color: '#F7931A',
    priceKey: 'BTC',
  },
  '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH': {
    symbol: 'USDG',
    name: 'USDG',
    decimals: 6,
    color: '#7EE081',
    stable: true,
  },
};

export const STABLECOIN_SYMBOLS = new Set(['USDC', 'USDT', 'USDG']);

export function resolveToken(mint) {
  return TOKEN_MAP[mint] || { symbol: mint.slice(0, 4) + '…', name: 'Unknown Token', decimals: 0, color: '#666' };
}

export function isStablecoin(symbol) {
  return STABLECOIN_SYMBOLS.has(symbol);
}
