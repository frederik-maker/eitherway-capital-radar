import { useWallet } from '../contexts/WalletContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import logoMark from '../assets/capital-radar-mark.svg';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-graphite-800 border border-graphite-600/50 glow-acid-sm">
        <img src={logoMark} alt="Capital Radar logo" className="w-7 h-7" />
      </div>
      <div>
        <span className="font-semibold text-cream-50 text-lg tracking-tight">Capital Radar</span>
        <span className="hidden sm:inline ml-2 font-mono text-[10px] text-acid uppercase tracking-widest bg-acid/10 px-1.5 py-0.5 rounded">
          Mainnet
        </span>
      </div>
    </div>
  );
}

function WalletBadge() {
  const { isConnected, publicKey, walletName, disconnect, isDemo, demoProfile, displayLabel } = useWallet();
  const { totalPortfolioValue, loading } = usePortfolio();

  if (!isConnected) return null;

  const short = publicKey
    ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`
    : '';
  const badgeLabel = demoProfile ? demoProfile.label : short;
  const badgeSubLabel = demoProfile ? short : walletName;

  return (
    <div className="flex items-center gap-3">
      {totalPortfolioValue > 0 && !loading && (
        <span className="hidden md:block value-large text-acid">
          ${totalPortfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
      )}
      <div className="flex items-center gap-2 bg-graphite-700/60 px-3 py-1.5 rounded-xl border border-graphite-600/50">
        <span
          className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse-slow`}
        />
        <span className={`${demoProfile ? 'text-xs font-semibold' : 'font-mono text-sm'} text-cream-200`}>
          {badgeLabel || displayLabel}
        </span>
        {badgeSubLabel && (
          <span className="text-[10px] text-cream-500 uppercase">{badgeSubLabel}</span>
        )}
      </div>
      <button onClick={disconnect} className="btn-ghost text-xs" title="Disconnect">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  );
}

export default function Header({ onToggleRail, railOpen }) {
  const { loading, refresh, portfolio } = usePortfolio();
  const { isConnected } = useWallet();

  return (
    <header className="sticky top-0 z-30 bg-graphite-950/80 backdrop-blur-xl border-b border-graphite-700/50">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <Logo />

        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              {portfolio?.lastUpdated && (
                <span className="hidden lg:block font-mono text-[10px] text-cream-500">
                  {new Date(portfolio.lastUpdated).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={refresh}
                disabled={loading}
                className={`btn-ghost p-1.5 ${loading ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {onToggleRail && (
                <button onClick={onToggleRail} className="btn-ghost p-1.5 hidden lg:block" title="Activity feed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={railOpen ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'}
                    />
                  </svg>
                </button>
              )}
            </>
          )}
          <WalletBadge />
        </div>
      </div>
    </header>
  );
}
