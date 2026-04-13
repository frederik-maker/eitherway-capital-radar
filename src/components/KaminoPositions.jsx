import { usePortfolio } from '../contexts/PortfolioContext';
import { usd, pct, healthLabel } from '../utils/format';

function LendingCard({ position }) {
  const isSupply = position.type === 'supply';
  return (
    <div className="card-dark-hover px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
            isSupply ? 'bg-emerald-400/15 text-emerald-400' : 'bg-red-400/15 text-red-400'
          }`}>
            {isSupply ? 'Supply' : 'Borrow'}
          </span>
          <span className="text-sm font-medium text-cream-100">{position.asset}</span>
        </div>
        <span className="font-mono text-sm text-cream-200">{usd(position.valueUsd)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-cream-400">
        <span>{position.amount.toLocaleString()} {position.asset}</span>
        <span className={isSupply ? 'text-emerald-400' : 'text-red-400'}>
          {position.apy?.toFixed(1)}% APY
        </span>
      </div>
      {position.utilization != null && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-graphite-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-acid/60 transition-all"
              style={{ width: `${Math.min(position.utilization, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-cream-500 mt-0.5">{position.utilization}% utilization</p>
        </div>
      )}
    </div>
  );
}

function VaultCard({ vault }) {
  const inRange = vault.inRange !== false;
  return (
    <div className="card-dark-hover px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-cream-100">{vault.name}</span>
          <span className="text-[10px] text-cream-500 bg-graphite-600/50 px-1.5 py-0.5 rounded">
            {vault.dex}
          </span>
        </div>
        <span className="font-mono text-sm text-cream-200">{usd(vault.deposited)}</span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-emerald-400 font-mono">{vault.apy?.toFixed(1)}% APY</span>
        <span className="text-cream-400">Fees 24h: {usd(vault.fees24h, 2)}</span>
        <span className={inRange ? 'text-emerald-400' : 'text-amber-400'}>
          {inRange ? '● In range' : '○ Out of range'}
        </span>
      </div>

      <p className="text-[10px] text-cream-500">{vault.strategy}</p>

      {vault.range && (
        <div className="flex items-center gap-2 text-[10px] text-cream-400">
          <span>${vault.range.lower}</span>
          <div className="flex-1 h-1 bg-graphite-700 rounded-full relative">
            <div
              className="absolute top-0 h-1 bg-acid/40 rounded-full"
              style={{
                left: `${Math.max(0, ((vault.range.lower - vault.range.lower * 0.9) / (vault.range.upper * 1.1 - vault.range.lower * 0.9)) * 100)}%`,
                right: `${Math.max(0, 100 - ((vault.range.upper - vault.range.lower * 0.9) / (vault.range.upper * 1.1 - vault.range.lower * 0.9)) * 100)}%`,
              }}
            />
            {vault.range.current && (
              <div
                className="absolute top-[-2px] w-1.5 h-1.5 rounded-full bg-acid"
                style={{
                  left: `${Math.min(100, Math.max(0, ((vault.range.current - vault.range.lower * 0.9) / (vault.range.upper * 1.1 - vault.range.lower * 0.9)) * 100))}%`,
                }}
              />
            )}
          </div>
          <span>${vault.range.upper}</span>
        </div>
      )}
    </div>
  );
}

export default function KaminoPositions() {
  const { kamino, kaminoSummary, kaminoLoading } = usePortfolio();

  if (kaminoLoading && !kamino) {
    return (
      <div className="card-dark p-6">
        <div className="skeleton h-4 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!kamino) return null;

  const hasPositions = kaminoSummary?.positionCount > 0;
  const hfInfo = healthLabel(kaminoSummary?.healthFactor);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-cream-50">Kamino Positions</h2>
          <span className="text-[10px] font-mono text-cream-500 bg-graphite-700 px-2 py-0.5 rounded">
            {kaminoSummary?.positionCount || 0} positions
          </span>
        </div>
        {kaminoSummary?.healthFactor != null && (
          <div className="flex items-center gap-2">
            <span className="label-mono">Health</span>
            <span className={`font-mono text-sm font-semibold ${hfInfo.color}`}>
              {kaminoSummary.healthFactor.toFixed(2)} {hfInfo.text}
            </span>
          </div>
        )}
      </div>

      {!hasPositions && (
        <div className="card-dark p-8 text-center space-y-3">
          <p className="text-sm text-cream-400">No Kamino positions found for this wallet.</p>
          <a
            href="https://app.kamino.finance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold text-acid hover:text-acid/80 transition-colors"
          >
            Explore Kamino Finance →
          </a>
        </div>
      )}

      {/* Summary cards */}
      {hasPositions && kaminoSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-dark px-3 py-2">
            <p className="label-mono text-[10px]">Total Supplied</p>
            <p className="font-mono text-lg text-emerald-400">{usd(kaminoSummary.totalSupplied)}</p>
          </div>
          <div className="card-dark px-3 py-2">
            <p className="label-mono text-[10px]">Total Borrowed</p>
            <p className="font-mono text-lg text-red-400">{usd(kaminoSummary.totalBorrowed)}</p>
          </div>
          <div className="card-dark px-3 py-2">
            <p className="label-mono text-[10px]">Vault Deposits</p>
            <p className="font-mono text-lg text-acid">{usd(kaminoSummary.totalVaults)}</p>
          </div>
          <div className="card-dark px-3 py-2">
            <p className="label-mono text-[10px]">Net Yield / yr</p>
            <p className="font-mono text-lg text-cream-100">{usd(kaminoSummary.netYieldDollars)}</p>
          </div>
        </div>
      )}

      {/* Lending positions */}
      {(kamino.lending?.length > 0 || kamino.borrowing?.length > 0) && (
        <div>
          <p className="label-mono mb-2">Lending & Borrowing</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kamino.lending?.map((p) => <LendingCard key={p.id} position={p} />)}
            {kamino.borrowing?.map((p) => <LendingCard key={p.id} position={p} />)}
          </div>
        </div>
      )}

      {/* Vaults */}
      {kamino.vaults?.length > 0 && (
        <div>
          <p className="label-mono mb-2">Liquidity Vaults</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kamino.vaults.map((v) => <VaultCard key={v.id} vault={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}
