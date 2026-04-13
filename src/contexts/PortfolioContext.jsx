import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useWallet } from './WalletContext';
import { getBalance, getTokenAccounts, getRecentSignatures } from '../services/solana';
import { fetchPrices } from '../services/prices';
import { getKaminoPositions, computeKaminoSummary } from '../services/kamino';
import { resolveToken, isStablecoin } from '../services/tokens';
import { getDemoProfileById } from '../demoProfiles';

const PortfolioContext = createContext(null);
const REFRESH_INTERVAL = 30_000;

function mapTokens(rawTokens, prices) {
  const tokens = rawTokens.map((token) => {
    const meta = resolveToken(token.mint);
    const priceKey = meta.priceKey || meta.symbol;
    const price = prices[priceKey]?.usd || (meta.stable ? 1 : 0);

    return {
      ...token,
      symbol: meta.symbol,
      name: meta.name,
      color: meta.color,
      valueUsd: token.amount * price,
      price,
      stable: meta.stable || false,
    };
  });

  return tokens
    .filter((token) => token.stable || token.price > 0 || token.valueUsd >= 1)
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be inside PortfolioProvider');
  return ctx;
}

export function PortfolioProvider({ children }) {
  const { publicKey, isConnected, demoProfile, isDemoProfile, isDemo } = useWallet();
  const [loading, setLoading] = useState(false);
  const [kaminoLoading, setKaminoLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [kamino, setKamino] = useState(null);
  const [kaminoSummary, setKaminoSummary] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const fetchingRef = useRef(false);
  const latestPublicKeyRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    latestPublicKeyRef.current = publicKey;
  }, [publicKey]);

  const fetchAll = useCallback(async () => {
    if (!publicKey || fetchingRef.current) return;
    fetchingRef.current = true;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    const targetKey = publicKey;
    setLoading((prev) => (!prev ? true : prev));

    try {
      if (isDemoProfile && demoProfile?.id) {
        const profile = getDemoProfileById(demoProfile.id);
        if (!profile) throw new Error('Demo profile not found');

        const portfolioData = {
          ...profile.portfolio,
          tokenScanComplete: profile.portfolio?.tokenScanComplete ?? true,
          lastUpdated: Date.now(),
        };

        setPortfolio(portfolioData);
        setKamino(profile.kamino);
        setKaminoSummary(computeKaminoSummary(profile.kamino));
        setKaminoLoading(false);
        setError(null);
        return;
      }

      // Always fetch real on-chain data via QuickNode RPC
      const tokenAccountsPromise = getTokenAccounts(targetKey);
      const kaminoPromise = getKaminoPositions(targetKey);
      const results = await Promise.allSettled([
        getBalance(targetKey),
        getRecentSignatures(targetKey),
        fetchPrices(),
      ]);

      const rpcFailed =
        results[0].status === 'rejected' &&
        results[1].status === 'rejected';

      if (rpcFailed) {
        throw new Error('Unable to load live wallet data from Solana right now.');
      }

      const solBalance = results[0].status === 'fulfilled' ? results[0].value : 0;
      const recentTxs = results[1].status === 'fulfilled' ? results[1].value : [];
      const prices = results[2].status === 'fulfilled' ? results[2].value : {};

      const solPrice = prices.SOL?.usd || 0;

      const portfolioData = {
        solBalance,
        solValueUsd: solBalance * solPrice,
        tokens: [],
        tokenScanComplete: false,
        recentTxs,
        prices,
        lastUpdated: Date.now(),
      };

      if (latestPublicKeyRef.current === targetKey && requestIdRef.current === requestId) {
        setPortfolio(portfolioData);
        setKamino(null);
        setKaminoSummary(null);
        setKaminoLoading(true);
        setError(null);
        setLoading(false);
      }

      tokenAccountsPromise
        .then((rawTokens) => {
          if (latestPublicKeyRef.current !== targetKey || requestIdRef.current !== requestId) {
            return;
          }

          const tokens = mapTokens(rawTokens, prices);
          setPortfolio((prev) =>
            prev
              ? {
                  ...prev,
                  tokens,
                  tokenScanComplete: true,
                  lastUpdated: Date.now(),
                }
              : prev
          );
        })
        .catch((error) => {
          console.warn('Token account lookup failed', error);
          if (latestPublicKeyRef.current === targetKey && requestIdRef.current === requestId) {
            setPortfolio((prev) =>
              prev
                ? {
                    ...prev,
                    tokenScanComplete: true,
                    lastUpdated: Date.now(),
                  }
                : prev
            );
          }
        });

      kaminoPromise
        .then((kPositions) => {
          if (latestPublicKeyRef.current !== targetKey || requestIdRef.current !== requestId) {
            return;
          }

          setKamino(kPositions);
          setKaminoSummary(computeKaminoSummary(kPositions));
        })
        .catch((error) => {
          console.warn('Kamino positions failed', error);
        })
        .finally(() => {
          if (latestPublicKeyRef.current === targetKey && requestIdRef.current === requestId) {
            setKaminoLoading(false);
          }
        });

    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError(err.message);
      setKaminoLoading(false);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [demoProfile?.id, isDemoProfile, publicKey]);

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchAll();
      if (!isDemoProfile) {
        intervalRef.current = setInterval(fetchAll, REFRESH_INTERVAL);
      }
    } else {
      setPortfolio(null);
      setKamino(null);
      setKaminoSummary(null);
      setKaminoLoading(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [isConnected, publicKey, fetchAll, isDemoProfile]);

  // Derived values
  const idleCapital =
    portfolio?.tokens
      ?.filter((t) => isStablecoin(t.symbol))
      .reduce((s, t) => s + t.valueUsd, 0) || 0;

  const totalWalletValue =
    (portfolio?.solValueUsd || 0) +
    (portfolio?.tokens?.reduce((s, t) => s + t.valueUsd, 0) || 0);

  const totalPortfolioValue = totalWalletValue + (kaminoSummary?.totalDeployed || 0);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        kamino,
        kaminoSummary,
        loading,
        kaminoLoading,
        error,
        refresh: fetchAll,
        idleCapital,
        totalWalletValue,
        totalPortfolioValue,
        mode: isDemoProfile ? 'demo-profile' : isDemo ? 'read-only-address' : 'live-wallet',
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}
