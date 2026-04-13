import { usePortfolio } from '../contexts/PortfolioContext';
import { useWallet } from '../contexts/WalletContext';
import { shortAddr, timeAgo } from '../utils/format';

function TxRow({ tx }) {
  const isFailed = !!tx.err;
  const sig = tx.signature || '';
  const short = sig.length > 12 ? `${sig.slice(0, 8)}…${sig.slice(-4)}` : sig;
  const href = tx.externalUrl || (sig ? `https://solscan.io/tx/${sig}` : null);
  const title = tx.title || short;
  const subtitle = tx.subtitle || (isFailed ? 'Failed' : tx.confirmationStatus || 'Confirmed');
  const content = (
    <>
      <div className={`w-2 h-2 rounded-full shrink-0 ${isFailed ? 'bg-red-400' : 'bg-emerald-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-cream-200 group-hover:text-acid transition-colors truncate">
          {title}
        </p>
        <p className="text-[10px] text-cream-500">
          {subtitle}
        </p>
      </div>
      <span className="text-[10px] text-cream-500 shrink-0">{timeAgo(tx.blockTime)}</span>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3 px-4 py-2.5">{content}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-graphite-800/60 transition-colors group"
    >
      {content}
    </a>
  );
}

export default function ActivityRail({ onClose }) {
  const { portfolio, loading } = usePortfolio();
  const { publicKey, demoProfile } = useWallet();

  const txs = portfolio?.recentTxs || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-graphite-700/50">
        <div>
          <p className="text-sm font-semibold text-cream-100">Activity</p>
          <p className="text-[10px] text-cream-500 font-mono">{shortAddr(publicKey)}</p>
        </div>
        <div className="flex items-center gap-2">
          {publicKey && (
            <a
              href={`https://solscan.io/account/${publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-[10px] text-cream-400"
            >
              Solscan ↗
            </a>
          )}
          {onClose && (
            <button onClick={onClose} className="btn-ghost p-1 lg:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && txs.length === 0 ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2">
                <div className="skeleton w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : txs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-cream-500">No recent transactions</p>
          </div>
        ) : (
          <div className="py-1">
            {txs.map((tx, i) => (
              <TxRow key={tx.signature || i} tx={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="border-t border-graphite-700/50 p-3 space-y-1.5">
        <p className="label-mono text-[10px] mb-1">Quick Links</p>
        {[
          { label: 'Kamino Finance', href: 'https://app.kamino.finance' },
          { label: 'Jupiter Swap', href: 'https://jup.ag' },
          ...(publicKey
            ? [{ label: demoProfile ? 'Source Wallet' : 'Solscan Explorer', href: `https://solscan.io/account/${publicKey}` }]
            : []),
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-1.5 text-xs text-cream-400 hover:text-acid hover:bg-graphite-800/40 rounded-lg transition-colors"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
