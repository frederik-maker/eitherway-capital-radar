import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import Header from './Header';
import ConnectScreen from './ConnectScreen';
import Dashboard from './Dashboard';
import KaminoPositions from './KaminoPositions';
import ActionCenter from './ActionCenter';
import ActivityRail from './ActivityRail';

export default function Layout() {
  const { isConnected } = useWallet();
  const [railOpen, setRailOpen] = useState(() => window.innerWidth >= 1024);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <ConnectScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleRail={() => setRailOpen((v) => !v)} railOpen={railOpen} />
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Dashboard />
          <KaminoPositions />
          <ActionCenter />
          <footer className="pt-8 pb-4 text-center">
            <p className="label-mono text-cream-500">
              Capital Radar &middot; Powered by Kamino &middot; Solflare &middot; QuickNode
            </p>
          </footer>
        </main>

        {/* Activity Rail */}
        <aside
          className={`${
            railOpen ? 'w-80 xl:w-96' : 'w-0'
          } transition-all duration-300 overflow-hidden border-l border-graphite-700 bg-graphite-950 hidden lg:block`}
        >
          {railOpen && <ActivityRail />}
        </aside>
      </div>

      {/* Mobile activity rail toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setRailOpen((v) => !v)}
          className="btn-acid rounded-full w-12 h-12 flex items-center justify-center shadow-lg glow-acid-sm"
          aria-label="Toggle activity feed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>

      {/* Mobile activity rail overlay */}
      {railOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRailOpen(false)} />
          <div className="relative w-80 bg-graphite-950 border-l border-graphite-700 animate-fade-in">
            <ActivityRail onClose={() => setRailOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
