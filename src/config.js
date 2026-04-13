const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (isLocalhost ? '' : 'https://api.eitherway.ai');

export const QUICKNODE_RPC =
  import.meta.env.VITE_QUICKNODE_RPC_URL ||
  import.meta.env.VITE_SOLANA_RPC_URL ||
  'https://docs-demo.solana-mainnet.quiknode.pro/';

export const PROXY_API = (url) =>
  `${API_BASE_URL}/api/proxy-api?url=${encodeURIComponent(url)}`;

export const COINGECKO_PRICE = (ids) =>
  PROXY_API(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  );

export const KAMINO_API = (path) =>
  PROXY_API(`https://api.kamino.finance${path}`);
