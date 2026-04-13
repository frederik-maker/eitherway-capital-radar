import { usePortfolio } from '../contexts/PortfolioContext';
import { useWallet } from '../contexts/WalletContext';
import { usd, pct, compactNum, healthLabel } from '../utils/format';

function StatCard({ label, value, sub, className = '' }) {
  return (
    <div className={`card-dark px-4 py-3 ${className}`}>
      <p className="label-mono mb-1">{label}</p>
      <p className="value-large text-cream-50">{value}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

function PriceChip({ symbol, price, change }) {
  const isUp = change >= 0;
  return (
    <div className="card-dark-hover px-3 py-2 flex items-center gap-2 min-w-[120px]">
      <span className="text-sm font-medium text-cream-100">{symbol}</span>
      <span className="font-mono text-sm text-cream-200">
        {price < 0.01 ? `$${price.toFixed(6)}` : usd(price, price > 100 ? 0 : 2)}
      </span>
      <span className={`font-mono text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {pct(change)}
      </span>
    </div>
  );
}

function TokenRow({ token }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-graphite-700/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: token.color || '#444', color: '#fff' }}>
          {token.symbol?.slice(0, 2) || '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-cream-100">{token.symbol}</p>
          <p className="text-xs text-cream-500">{compactNum(token.amount)}</p>
        </div>
      </div>
      <p className="font-mono text-sm text-cream-200">{usd(token.valueUsd)}</p>
    </div>
  );
}

function PortfolioBreakdown() {
  const { portfolio, kaminoSummary, totalWalletValue, totalPortfolioValue } = usePortfolio();

  if (!portfolio) return null;

  const walletPct = totalPortfolioValue > 0 ? (totalWalletValue / totalPortfolioValue) * 100 : 0;
  const kaminoPct = totalPortfolioValue > 0 ? ((kaminoSummary?.totalDeployed || 0) / totalPortfolioValue) * 100 : 0;

  return (
    <div className="card-dark p-4 space-y-3">
      <p className="label-mono">Capital Allocation</p>
      <div className="h-3 rounded-full bg-graphite-700 overflow-hidden flex">
        <div className="bg-acid rounded-l-full transition-all" style={{ width: `${walletPct}%` }} />
        <div className="bg-emerald-500 transition-all" style={{ width: `${kaminoPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-cream-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-acid" />
          Wallet {walletPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Kamino {kaminoPct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    portfolio,
    kaminoSummary,
    loading,
    kaminoLoading,
    idleCapital,
    totalPortfolioValue,
    totalWalletValue,
    mode,
  } = usePortfolio();
  const { isDemo, demoProfile } = useWallet();

  if (loading && !portfolio) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-dark px-4 py-3">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-7 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const { solBalance, solValueUsd, tokens, prices } = portfolio;
  const tokenScanComplete = portfolio.tokenScanComplete !== false;
  const hf = kaminoSummary?.healthFactor;
  const hfInfo = healthLabel(hf);

  return (
    <div className="space-y-4">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-amber-200">
            {mode === 'demo-profile'
              ? demoProfile?.sourceLabel || 'Curated demo scenario for showcasing the full product surface.'
              : 'Read-only mode — viewing real on-chain data for this address.'}
          </span>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Portfolio"
          value={usd(totalPortfolioValue)}
          className="col-span-2 lg:col-span-1 glow-acid border-acid/20"
        />
        <StatCard
          label="Wallet"
          value={usd(totalWalletValue)}
          sub={<span className="text-cream-400">{solBalance.toFixed(2)} SOL</span>}
        />
        <StatCard
          label="Kamino Deployed"
          value={kaminoLoading && !kaminoSummary ? 'Loading…' : usd(kaminoSummary?.totalDeployed || 0)}
          sub={
            kaminoSummary?.blendedApy ? (
              <span className="text-emerald-400">APY {kaminoSummary.blendedApy.toFixed(1)}%</span>
            ) : null
          }
        />
        <StatCard
          label="Health Factor"
          value={kaminoLoading && hf == null ? 'Loading…' : hf != null ? hf.toFixed(2) : '–'}
          sub={<span className={hfInfo.color}>{hfInfo.text}</span>}
        />
      </div>

      {/* Idle capital alert */}
      {idleCapital > 500 && (
        <div className="card-dark border-amber-400/30 px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-cream-300">
            <span className="font-semibold text-amber-400">{usd(idleCapital)}</span> in idle stablecoins.
            Consider deploying to Kamino lending or a stable vault for ~6-8% APY.
          </p>
        </div>
      )}

      {/* Price ticker + allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(prices || {}).map(([sym, p]) => (
              <PriceChip key={sym} symbol={sym} price={p.usd} change={p.change24h} />
            ))}
          </div>
        </div>
        <PortfolioBreakdown />
      </div>

      {/* Token holdings */}
      {(tokens.length > 0 || !tokenScanComplete) && (
        <div className="card-dark p-4">
          <p className="label-mono mb-3">Token Holdings</p>
          {!tokenScanComplete && (
            <p className="text-xs text-cream-500 mb-3">Scanning token accounts…</p>
          )}
          <div className="space-y-0.5">
            {/* SOL first */}
            <div className="flex items-center justify-between py-2.5 px-3 hover:bg-graphite-700/30 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                  SO
                </div>
                <div>
                  <p className="text-sm font-medium text-cream-100">SOL</p>
                  <p className="text-xs text-cream-500">{solBalance.toFixed(4)}</p>
                </div>
              </div>
              <p className="font-mono text-sm text-cream-200">{usd(solValueUsd)}</p>
            </div>
            {tokens.map((t) => (
              <TokenRow key={t.mint} token={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
