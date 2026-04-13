import { COINGECKO_PRICE } from '../config';

let cache = { data: null, ts: 0 };
const CACHE_TTL = 45_000;

const COINGECKO_IDS =
  'solana,usd-coin,tether,jito-staked-sol,marinade-staked-sol,bonk,ethereum,bitcoin';

const ID_TO_SYMBOL = {
  solana: 'SOL',
  'usd-coin': 'USDC',
  tether: 'USDT',
  'jito-staked-sol': 'JitoSOL',
  'marinade-staked-sol': 'mSOL',
  bonk: 'BONK',
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export async function fetchPrices() {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  try {
    const res = await fetch(COINGECKO_PRICE(COINGECKO_IDS));
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const raw = await res.json();

    const prices = {};
    for (const [cgId, vals] of Object.entries(raw)) {
      const sym = ID_TO_SYMBOL[cgId];
      if (sym) {
        prices[sym] = {
          usd: vals.usd ?? 0,
          change24h: vals.usd_24h_change ?? 0,
        };
      }
    }

    // Ensure stablecoins have a price even if CoinGecko omits them
    if (!prices.USDC) prices.USDC = { usd: 1, change24h: 0 };
    if (!prices.USDT) prices.USDT = { usd: 1, change24h: 0 };
    if (!prices.USDG) prices.USDG = { usd: 1, change24h: 0 };

    cache = { data: prices, ts: Date.now() };
    return prices;
  } catch (err) {
    if (cache.data) return cache.data;
    // Fallback static prices
    return {
      SOL: { usd: 148, change24h: 0 },
      USDC: { usd: 1, change24h: 0 },
      USDT: { usd: 1, change24h: 0 },
      JitoSOL: { usd: 165, change24h: 0 },
      mSOL: { usd: 170, change24h: 0 },
      BONK: { usd: 0.000025, change24h: 0 },
      ETH: { usd: 3200, change24h: 0 },
      BTC: { usd: 68000, change24h: 0 },
      USDG: { usd: 1, change24h: 0 },
    };
  }
}
