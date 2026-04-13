import { QUICKNODE_RPC } from '../config';

let rpcId = 0;
const RPC_TIMEOUT_MS = 10_000;
const TOKEN_PROGRAMS = [
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
];

async function rpc(method, params = []) {
  rpcId += 1;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  let res;

  try {
    res = await fetch(QUICKNODE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: rpcId, method, params }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`RPC request failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'RPC error');
  return data.result;
}

export async function getBalance(pubkey) {
  const result = await rpc('getBalance', [pubkey, { commitment: 'confirmed' }]);
  return (result?.value ?? 0) / 1e9;
}

export async function getTokenAccounts(pubkey) {
  const accountSets = await Promise.allSettled(
    TOKEN_PROGRAMS.map((programId) =>
      rpc('getTokenAccountsByOwner', [
        pubkey,
        { programId },
        { encoding: 'jsonParsed', commitment: 'confirmed' },
      ])
    )
  );

  return accountSets
    .flatMap((result) => (result.status === 'fulfilled' ? result.value?.value || [] : []))
    .map((acct) => {
      const info = acct.account.data.parsed?.info;
      if (!info) return null;
      return {
        mint: info.mint,
        owner: info.owner,
        amount: parseFloat(info.tokenAmount?.uiAmountString || '0'),
        decimals: info.tokenAmount?.decimals ?? 0,
        address: acct.pubkey,
      };
    })
    .filter((t) => t && t.amount > 0);
}

export async function getRecentSignatures(pubkey, limit = 15) {
  const result = await rpc('getSignaturesForAddress', [pubkey, { limit }]);
  return (result || []).map((sig) => ({
    signature: sig.signature,
    slot: sig.slot,
    blockTime: sig.blockTime,
    err: sig.err,
    memo: sig.memo,
    confirmationStatus: sig.confirmationStatus,
  }));
}

export async function getSlot() {
  return rpc('getSlot', [{ commitment: 'confirmed' }]);
}

export async function getEpochInfo() {
  return rpc('getEpochInfo', [{ commitment: 'confirmed' }]);
}
