import { useState, useMemo } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useWallet } from '../contexts/WalletContext';
import { usd, pct } from '../utils/format';

function generateInsights(portfolio, kaminoSummary, kamino) {
  const insights = [];
  const tokenScanComplete = portfolio?.tokenScanComplete !== false;

  if (!portfolio || !kaminoSummary) return insights;

  const idleStables = tokenScanComplete
    ? portfolio.tokens
        .filter((t) => ['USDC', 'USDT'].includes(t.symbol))
        .reduce((s, t) => s + t.valueUsd, 0)
    : 0;

  if (idleStables > 100) {
    insights.push({
      id: 'idle-stables',
      severity: 'suggestion',
      icon: '💡',
      title: 'Idle Stablecoins',
      detail: `${usd(idleStables)} sitting idle in wallet. Deploy to Kamino lending for ~7-9% APY or USDC-USDT stable vault for ~6% APY.`,
      action: 'Explore Kamino Lending',
      href: 'https://app.kamino.finance/lending',
    });
  }

  if (kaminoSummary.healthFactor && kaminoSummary.healthFactor < 1.5) {
    insights.push({
      id: 'low-health',
      severity: 'warning',
      icon: '⚠️',
      title: 'Low Health Factor',
      detail: `Health factor ${kaminoSummary.healthFactor.toFixed(2)} is below safe threshold. Consider repaying debt or adding collateral to avoid liquidation.`,
      action: 'Manage Positions',
      href: 'https://app.kamino.finance/lending',
    });
  }

  if (kaminoSummary.healthFactor && kaminoSummary.healthFactor > 4) {
    insights.push({
      id: 'over-collateral',
      severity: 'suggestion',
      icon: '🔓',
      title: 'Over-Collateralized',
      detail: `Health factor ${kaminoSummary.healthFactor.toFixed(2)} is very high. You could borrow more against your collateral to increase yield.`,
      action: 'View Borrow Options',
      href: 'https://app.kamino.finance/lending',
    });
  }

  if (kamino?.vaults) {
    const outOfRange = kamino.vaults.filter((v) => v.inRange === false);
    if (outOfRange.length > 0) {
      insights.push({
        id: 'out-of-range',
        severity: 'warning',
        icon: '📍',
        title: 'Vault Out of Range',
        detail: `${outOfRange.length} vault(s) are out of range: ${outOfRange.map((v) => v.name).join(', ')}. These positions are not earning fees.`,
        action: 'Rebalance',
        href: 'https://app.kamino.finance/liquidity',
      });
    }
  }

  const tokenValue = portfolio.tokens.reduce((sum, token) => sum + token.valueUsd, 0);
  const solPct =
    portfolio.solValueUsd + tokenValue > 0
      ? (portfolio.solValueUsd / (portfolio.solValueUsd + tokenValue)) * 100
      : 0;
  if (tokenScanComplete && solPct > 60) {
    insights.push({
      id: 'concentrated-sol',
      severity: 'info',
      icon: '📊',
      title: 'High SOL Concentration',
      detail: `${solPct.toFixed(0)}% of wallet value is in SOL. Consider diversifying into LSTs (JitoSOL, mSOL) or stable assets.`,
      action: 'Explore LSTs',
      href: 'https://app.kamino.finance/lending',
    });
  }

  if (kaminoSummary.blendedApy > 0) {
    insights.push({
      id: 'yield-summary',
      severity: 'info',
      icon: '📈',
      title: 'Yield Performance',
      detail: `Blended APY across all Kamino positions: ${kaminoSummary.blendedApy.toFixed(1)}%. Estimated yearly earnings: ${usd(kaminoSummary.netYieldDollars)}.`,
    });
  }

  return insights;
}

const SEVERITY_STYLES = {
  warning: 'border-amber-400/30 bg-amber-400/5',
  suggestion: 'border-acid/30 bg-acid/5',
  info: 'border-cream-500/20 bg-graphite-800',
};

export default function ActionCenter() {
  const { portfolio, kamino, kaminoSummary } = usePortfolio();
  const [dismissed, setDismissed] = useState(new Set());

  const insights = useMemo(
    () => generateInsights(portfolio, kaminoSummary, kamino),
    [portfolio, kaminoSummary, kamino]
  );

  const visible = insights.filter((i) => !dismissed.has(i.id));

  if (visible.length === 0 && insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cream-50">Action Center</h2>
        <span className="label-mono">{visible.length} insights</span>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-cream-500">All insights dismissed. They will reappear on next refresh.</p>
      )}

      <div className="space-y-2">
        {visible.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info}`}
          >
            <span className="text-lg shrink-0 mt-0.5">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-cream-100">{insight.title}</p>
              <p className="text-xs text-cream-400 mt-0.5 leading-relaxed">{insight.detail}</p>
              {insight.action && insight.href && (
                <a
                  href={insight.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-semibold text-acid hover:text-acid/80 transition-colors"
                >
                  {insight.action} →
                </a>
              )}
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, insight.id]))}
              className="btn-ghost p-1 text-cream-500 hover:text-cream-300 shrink-0"
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
