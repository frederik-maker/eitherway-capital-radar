import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DEMO_PROFILES, getDemoProfileById } from '../demoProfiles';

const WalletContext = createContext(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}

function detectWallets() {
  const wallets = [];
  if (window.solflare?.isSolflare) {
    wallets.push({ name: 'Solflare', provider: window.solflare, priority: 1 });
  }
  if (window.phantom?.solana?.isPhantom) {
    wallets.push({ name: 'Phantom', provider: window.phantom.solana, priority: 2 });
  }
  if (window.backpack?.isBackpack) {
    wallets.push({ name: 'Backpack', provider: window.backpack, priority: 3 });
  }
  return wallets.sort((a, b) => a.priority - b.priority);
}

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [demoProfileId, setDemoProfileId] = useState(null);
  const detectTimeoutRef = useRef(null);

  useEffect(() => {
    const detect = () => {
      const w = detectWallets();
      setAvailableWallets(w);
      return w;
    };

    // Wallets inject async; try immediately, then retry after a delay
    detect();
    detectTimeoutRef.current = setTimeout(() => {
      const w = detect();
      // Auto-reconnect if we had a session
      const saved = localStorage.getItem('cr_last_wallet');
      if (saved && w.length > 0) {
        const target = w.find((x) => x.name === saved) || w[0];
        connectWallet(target);
      }
    }, 600);

    return () => clearTimeout(detectTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWallet = useCallback(async (walletInfo) => {
    if (!walletInfo?.provider) return;

    setStatus('connecting');
    setError(null);

    try {
      const resp = await walletInfo.provider.connect();
      const pubkey =
        resp?.publicKey?.toString?.() ||
        walletInfo.provider.publicKey?.toString?.();

      if (!pubkey) throw new Error('No public key returned');

      setDemoProfileId(null);
      setWallet({
        publicKey: pubkey,
        provider: walletInfo.provider,
        name: walletInfo.name,
      });
      setStatus('connected');
      localStorage.setItem('cr_last_wallet', walletInfo.name);
    } catch (err) {
      console.error('Wallet connect error:', err);
      setStatus('error');
      setError(err.message || 'Connection failed');
      setTimeout(() => setStatus('disconnected'), 3000);
    }
  }, []);

  const connect = useCallback(
    async (walletName) => {
      const target =
        availableWallets.find((w) => w.name === walletName) ||
        availableWallets[0];
      if (!target) {
        setError('No wallet detected. Install Solflare to continue.');
        setStatus('error');
        setTimeout(() => setStatus('disconnected'), 3000);
        return;
      }
      await connectWallet(target);
    },
    [availableWallets, connectWallet]
  );

  const disconnect = useCallback(async () => {
    if (wallet?.provider?.disconnect) {
      try {
        await wallet.provider.disconnect();
      } catch {}
    }
    setWallet(null);
    setDemoProfileId(null);
    setStatus('disconnected');
    setError(null);
    localStorage.removeItem('cr_last_wallet');
  }, [wallet]);

  const connectDemo = useCallback((input) => {
    const profile =
      typeof input === 'string' ? getDemoProfileById(input) : input?.id ? input : null;
    const publicKey = profile?.address || input;
    if (!publicKey) return;

    setDemoProfileId(profile?.id || null);
    setWallet({
      publicKey,
      provider: null,
      name: profile ? 'Scenario' : 'Read-only',
    });
    setStatus('connected');
    localStorage.removeItem('cr_last_wallet');
  }, []);

  const demoProfile = demoProfileId ? getDemoProfileById(demoProfileId) : null;
  const displayLabel = demoProfile?.label || wallet?.publicKey || null;

  return (
    <WalletContext.Provider
      value={{
        wallet,
        status,
        error,
        availableWallets,
        demoProfiles: DEMO_PROFILES,
        demoProfile,
        connect,
        disconnect,
        connectDemo,
        isConnected: status === 'connected',
        isDemo: Boolean(wallet && !wallet.provider),
        isDemoProfile: Boolean(demoProfile),
        publicKey: wallet?.publicKey || null,
        walletName: wallet?.name || null,
        displayLabel,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
