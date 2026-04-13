export function usd(value, decimals = 0) {
  if (value == null || isNaN(value)) return '$–';
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }
  return `$${value.toFixed(decimals > 0 ? decimals : 2)}`;
}

export function pct(value, decimals = 1) {
  if (value == null || isNaN(value)) return '–%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function shortAddr(addr) {
  if (!addr || addr.length < 10) return addr || '';
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function compactNum(value) {
  if (value == null || isNaN(value)) return '–';
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(2);
}

export function timeAgo(unixSeconds) {
  if (!unixSeconds) return '';
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function healthLabel(hf) {
  if (hf == null) return { text: '–', color: 'text-cream-500' };
  if (hf > 2) return { text: 'Safe', color: 'health-safe' };
  if (hf > 1.2) return { text: 'Watch', color: 'health-warn' };
  return { text: 'At Risk', color: 'health-danger' };
}
