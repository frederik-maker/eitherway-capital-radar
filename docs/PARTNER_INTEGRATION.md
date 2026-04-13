# Partner Integration

Capital Radar is built around the idea that wallet state, productive capital, and risk should be visible in the same interface.

## Solflare

Solflare is treated as the primary wallet path, not a generic connect button.

Current implementation:

- detects Solflare before other injected wallets
- gives Solflare-first connection priority
- falls back to an install CTA when no wallet is present
- keeps the wallet experience centered in the first screen instead of hiding it behind a dashboard shell

Relevant code:

- `src/contexts/WalletContext.jsx`
- `src/components/ConnectScreen.jsx`

## Kamino

Kamino is the core capital layer.

Current implementation:

- fetches lending markets from Kamino
- resolves obligations for the inspected wallet
- normalizes supplies, borrows, utilization, and health factor into UI-friendly cards
- shows curated scenarios for reliable demos and live parsing for real addresses
- powers the action center risk and deployment prompts

Relevant code:

- `src/services/kamino.js`
- `src/components/KaminoPositions.jsx`
- `src/components/ActionCenter.jsx`

## QuickNode

QuickNode is used as the live Solana read layer.

Current implementation:

- wallet SOL balance
- SPL token account reads
- recent signatures for the activity rail
- env-based RPC override for production deployment

Relevant code:

- `src/config.js`
- `src/services/solana.js`
- `src/contexts/PortfolioContext.jsx`

## Eitherway fit

The Eitherway build is not a thin wrapper around partner logos. The product is structured around partner capabilities:

- Solflare owns the wallet entry and first-run UX
- QuickNode owns the live wallet state layer
- Kamino owns the deployed-capital and risk layer

That is the center of the user flow, not an afterthought.
