import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export default function ConnectScreen() {
  const { connect, availableWallets, status, error, connectDemo, demoProfiles } = useWallet();
  const [showDemo, setShowDemo] = useState(false);
  const [customAddr, setCustomAddr] = useState('');

  const connecting = status === 'connecting';

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-graphite-800 border border-graphite-600/50 glow-acid">
            <svg viewBox="0 0 32 32" className="w-10 h-10">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#CDFF00" strokeWidth="1.5" opacity="0.4" />
              <circle cx="16" cy="16" r="8" fill="none" stroke="#CDFF00" strokeWidth="1.5" opacity="0.7" />
              <circle cx="16" cy="16" r="3" fill="#CDFF00" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-cream-50 tracking-tight">Capital Radar</h1>
          <p className="text-cream-400 text-sm leading-relaxed max-w-sm mx-auto">
            Wallet-first Solana command center. Inspect any mainnet address or open a curated
            scenario with realistic capital deployment, risk, and Kamino activity.
          </p>
        </div>

        {/* Wallet buttons */}
        <div className="space-y-3">
          {availableWallets.length > 0 ? (
            availableWallets.map((w) => (
              <button
                key={w.name}
                onClick={() => connect(w.name)}
                disabled={connecting}
                className="w-full btn-acid flex items-center justify-center gap-3 text-base py-3"
              >
                {connecting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  `Connect ${w.name}`
                )}
              </button>
            ))
          ) : (
            <a
              href="https://solflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-acid flex items-center justify-center gap-3 text-base py-3"
            >
              Install Solflare Wallet
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-400/10 px-4 py-2 rounded-xl">
            {error}
          </div>
        )}

        {/* Demo mode */}
        <div className="border-t border-graphite-700 pt-6">
          <button
            onClick={() => setShowDemo((v) => !v)}
            className="w-full btn-ghost text-sm text-center py-2"
          >
            {showDemo ? 'Hide scenario and lookup tools' : 'Open scenarios or inspect an address'}
          </button>

          {showDemo && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {demoProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => connectDemo(profile)}
                  className="w-full card-dark-hover px-4 py-3 text-left flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-cream-100">{profile.label}</p>
                    <p className="text-xs text-cream-400 mt-0.5">{profile.description}</p>
                    <p className="font-mono text-[10px] text-cream-500 mt-1">
                      {profile.address.slice(0, 8)}…{profile.address.slice(-6)}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-cream-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={customAddr}
                  onChange={(e) => setCustomAddr(e.target.value.trim())}
                  placeholder="Paste any Solana wallet for live mainnet lookup…"
                  className="flex-1 bg-graphite-800 border border-graphite-600 rounded-xl px-3 py-2 text-sm text-cream-100 font-mono placeholder:text-cream-500/60 focus:outline-none focus:border-acid/50"
                />
                <button
                  onClick={() => {
                    if (customAddr.length >= 32) connectDemo(customAddr);
                  }}
                  disabled={customAddr.length < 32}
                  className="btn-outline text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: 'Read-only', desc: 'No signing required' },
            { label: 'Mainnet', desc: 'Live Solana data' },
            { label: 'Kamino', desc: 'Full position view' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs font-semibold text-acid">{item.label}</p>
              <p className="text-[10px] text-cream-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
