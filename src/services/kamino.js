import { KAMINO_API } from '../config';
import { resolveToken } from './tokens';

const EMPTY_POSITIONS = {
  lending: [],
  borrowing: [],
  vaults: [],
  healthFactor: null,
  obligations: [],
};

const MAIN_MARKET = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';
const DEFAULT_DECIMALS = 6;
const SF_SCALE = 2 ** 60;
const EMPTY_RESERVE = '11111111111111111111111111111111';
const REQUEST_TIMEOUT_MS = 12_000;

async function fetchJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;

  try {
    res = await fetch(KAMINO_API(path), { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Kamino API ${res.status} for ${path}`);
  }

  return res.json();
}

async function getMarkets() {
  try {
    const markets = await fetchJson('/v2/kamino-market');
    return Array.isArray(markets) ? markets : [];
  } catch {
    return [];
  }
}

async function getReserveMetrics(marketPubkey) {
  try {
    const metrics = await fetchJson(`/kamino-market/${marketPubkey}/reserves/metrics`);
    return Array.isArray(metrics) ? metrics : [];
  } catch {
    return [];
  }
}

async function getUserObligations(marketPubkey, pubkey) {
  try {
    const obligations = await fetchJson(
      `/kamino-market/${marketPubkey}/users/${pubkey}/obligations`
    );
    return Array.isArray(obligations) ? obligations : [];
  } catch {
    return [];
  }
}

async function getVaultPositions(pubkey) {
  try {
    const vaults = await fetchJson(`/kvaults/users/${pubkey}/positions`);
    return Array.isArray(vaults) ? vaults : [];
  } catch {
    return [];
  }
}

function numberish(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function guessDecimals(metric) {
  const mint = metric?.liquidityTokenMint;
  const resolved = mint ? resolveToken(mint) : null;
  if (resolved?.decimals != null) {
    return resolved.decimals;
  }

  const symbol = metric?.liquidityToken?.toUpperCase?.() || '';
  if (['BTC', 'CBBTC', 'WBTC'].includes(symbol)) return 8;
  if (symbol === 'ETH') return 8;
  if (
    ['SOL', 'JSOL', 'JITOSOL', 'MSOL', 'BSOL', 'VSOL', 'STSOL'].includes(symbol) ||
    symbol.endsWith('SOL')
  ) {
    return 9;
  }

  return DEFAULT_DECIMALS;
}

function reservePriceUsd(metric) {
  const supply = numberish(metric?.totalSupply);
  const supplyUsd = numberish(metric?.totalSupplyUsd);
  const borrow = numberish(metric?.totalBorrow);
  const borrowUsd = numberish(metric?.totalBorrowUsd);

  if (supply > 0 && supplyUsd > 0) {
    return supplyUsd / supply;
  }

  if (borrow > 0 && borrowUsd > 0) {
    return borrowUsd / borrow;
  }

  return 0;
}

function sfToUsd(value) {
  return numberish(value) / SF_SCALE;
}

function normalizeReservePosition({
  rawAmount,
  valueUsd,
  reserveAddress,
  metric,
  positionType,
  marketName,
  apy,
  utilization = null,
}) {
  const symbol = metric?.liquidityToken || 'Unknown';
  const decimals = guessDecimals(metric);
  const amount = rawAmount / 10 ** decimals;
  const pricedValue = amount * reservePriceUsd(metric);

  return {
    id: `${positionType}-${marketName}-${reserveAddress}`,
    asset: symbol,
    type: positionType,
    amount: Number.isFinite(amount) ? amount : 0,
    valueUsd: pricedValue > 0 ? pricedValue : valueUsd,
    apy,
    utilization: utilization == null ? null : Number(utilization.toFixed(1)),
    market: marketName,
    reserveAddress,
    mint: metric?.liquidityTokenMint || null,
  };
}

function normalizeVaults(rawVaults) {
  return rawVaults.map((vault, index) => ({
    id: vault.kvault || vault.vaultAddress || `vault-${index}`,
    name:
      vault.vaultName ||
      vault.symbol ||
      vault.kvaultSymbol ||
      vault.strategyName ||
      `Vault ${index + 1}`,
    strategy: vault.strategy || vault.strategyName || vault.tokenSymbol || 'Kamino Vault',
    deposited:
      numberish(vault.usdValue) ||
      numberish(vault.positionUsd) ||
      numberish(vault.depositedUsd) ||
      numberish(vault.currentValue) ||
      0,
    apy: numberish(vault.apy) || numberish(vault.estimatedApy) || 0,
    fees24h: numberish(vault.fees24h) || numberish(vault.feesEarned24h) || 0,
    range: vault.range || null,
    inRange: vault.inRange ?? vault.isInRange ?? true,
    dex: vault.dex || vault.protocol || '',
  }));
}

function computeHealthFactor(obligation) {
  const stats = obligation?.refreshedStats;
  if (!stats) return null;

  const borrowed = numberish(stats.userTotalBorrow);
  const liquidationLimit = numberish(stats.borrowLiquidationLimit);

  if (borrowed <= 0 || liquidationLimit <= 0) return null;
  return liquidationLimit / borrowed;
}

function mergePositionLists(groups, key) {
  return groups
    .flat()
    .filter(Boolean)
    .sort((a, b) => (b?.[key] || 0) - (a?.[key] || 0));
}

function pickPrimaryMarket(markets) {
  return (
    markets.find((market) => market.isPrimary)?.lendingMarket ||
    markets.find((market) => market.lendingMarket === MAIN_MARKET)?.lendingMarket ||
    markets[0]?.lendingMarket ||
    MAIN_MARKET
  );
}

export async function getKaminoPositions(pubkey) {
  try {
    const [markets, rawVaults] = await Promise.all([getMarkets(), getVaultPositions(pubkey)]);
    const marketPubkeys = Array.from(
      new Set([pickPrimaryMarket(markets), ...markets.map((market) => market.lendingMarket)].filter(Boolean))
    );
    const metricsCache = new Map();

    const lendingGroups = [];
    const borrowingGroups = [];
    const healthFactors = [];
    const obligationSummaries = [];

    for (const marketPubkey of marketPubkeys) {
      const obligations = await getUserObligations(marketPubkey, pubkey);
      if (!obligations.length) continue;

      let metrics = metricsCache.get(marketPubkey);
      if (!metrics) {
        metrics = await getReserveMetrics(marketPubkey);
        metricsCache.set(marketPubkey, metrics);
      }

      const marketName =
        markets.find((market) => market.lendingMarket === marketPubkey)?.name ||
        (marketPubkey === MAIN_MARKET ? 'Main Market' : 'Kamino Market');
      const metricsMap = new Map(metrics.map((metric) => [metric.reserve, metric]));

      for (const obligation of obligations) {
        const obligationState = obligation?.state || {};
        const deposits = (obligationState.deposits || [])
          .filter(
            (deposit) =>
              deposit.depositReserve !== EMPTY_RESERVE && numberish(deposit.depositedAmount) > 0
          )
          .map((deposit) =>
            normalizeReservePosition({
              rawAmount: numberish(deposit.depositedAmount),
              valueUsd: sfToUsd(deposit.marketValueSf),
              reserveAddress: deposit.depositReserve,
              metric: metricsMap.get(deposit.depositReserve),
              positionType: 'supply',
              marketName,
              apy: numberish(metricsMap.get(deposit.depositReserve)?.supplyApy) * 100,
              utilization:
                numberish(metricsMap.get(deposit.depositReserve)?.totalBorrow) > 0 &&
                numberish(metricsMap.get(deposit.depositReserve)?.totalSupply) > 0
                  ? (numberish(metricsMap.get(deposit.depositReserve)?.totalBorrow) /
                      numberish(metricsMap.get(deposit.depositReserve)?.totalSupply)) *
                    100
                  : null,
            })
          );

        const borrows = (obligationState.borrows || [])
          .filter(
            (borrow) =>
              borrow.borrowReserve !== EMPTY_RESERVE &&
              (numberish(borrow.borrowedAmountOutsideElevationGroups) > 0 ||
                numberish(borrow.borrowedAmountSf) > 0)
          )
          .map((borrow) => {
            const metric = metricsMap.get(borrow.borrowReserve);
            return normalizeReservePosition({
              rawAmount:
                numberish(borrow.borrowedAmountOutsideElevationGroups) ||
                numberish(borrow.borrowedAmountSf),
              valueUsd: sfToUsd(borrow.marketValueSf),
              reserveAddress: borrow.borrowReserve,
              metric,
              positionType: 'borrow',
              marketName,
              apy: numberish(metric?.borrowApy) * 100,
            });
          });

        lendingGroups.push(deposits);
        borrowingGroups.push(borrows);

        const hf = computeHealthFactor(obligation);
        if (hf != null) {
          healthFactors.push(hf);
        }

        obligationSummaries.push({
          market: marketName,
          obligationAddress: obligation.obligationAddress,
          borrowedUsd: numberish(obligation?.refreshedStats?.userTotalBorrow),
          depositedUsd: numberish(obligation?.refreshedStats?.userTotalDeposit),
        });
      }

      if (obligationSummaries.length) {
        break;
      }
    }

    const lending = mergePositionLists(lendingGroups, 'valueUsd');
    const borrowing = mergePositionLists(borrowingGroups, 'valueUsd');
    const vaults = normalizeVaults(rawVaults);

    return {
      lending,
      borrowing,
      vaults,
      healthFactor: healthFactors.length ? Math.min(...healthFactors) : null,
      obligations: obligationSummaries,
    };
  } catch (error) {
    console.warn('Kamino lookup failed', error);
    return EMPTY_POSITIONS;
  }
}

export function computeKaminoSummary(positions) {
  if (!positions) return null;

  const totalSupplied = positions.lending.reduce((sum, position) => sum + (position.valueUsd || 0), 0);
  const totalBorrowed = positions.borrowing.reduce(
    (sum, position) => sum + (position.valueUsd || 0),
    0
  );
  const totalVaults = positions.vaults.reduce((sum, vault) => sum + (vault.deposited || 0), 0);

  const supplyWeighted = positions.lending.reduce(
    (sum, position) => sum + (position.valueUsd || 0) * (position.apy || 0),
    0
  );
  const vaultWeighted = positions.vaults.reduce(
    (sum, vault) => sum + (vault.deposited || 0) * (vault.apy || 0),
    0
  );
  const borrowCost = positions.borrowing.reduce(
    (sum, position) => sum + (position.valueUsd || 0) * (position.apy || 0),
    0
  );

  const totalDeployed = totalSupplied + totalVaults;
  const netYieldDollars = (supplyWeighted + vaultWeighted - borrowCost) / 100;
  const blendedApy =
    totalDeployed > 0
      ? (supplyWeighted + vaultWeighted - borrowCost) / totalDeployed
      : 0;

  return {
    totalSupplied,
    totalBorrowed,
    totalVaults,
    totalDeployed,
    blendedApy,
    netYieldDollars,
    healthFactor: positions.healthFactor,
    positionCount:
      positions.lending.length + positions.borrowing.length + positions.vaults.length,
  };
}
