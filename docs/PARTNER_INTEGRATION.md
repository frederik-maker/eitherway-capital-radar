# Partner Integration

Capital Radar is built around a simple idea: wallet state, productive capital, and execution context should live in the same surface.

## Kamino

Kamino is the core capital layer in the product.

Capital Radar uses Kamino to frame the user's productive positions and risk:

- active deposits and borrows
- vault allocation
- yield visibility
- health and liquidation distance
- action opportunities such as deploying idle stablecoins or reducing risky exposure

The product is designed so Kamino is not a sidebar integration. It is the center of the capital workflow.

Reference:

- https://kamino.com/docs/build/developers/overview

## Solflare

Solflare is treated as the wallet interface layer rather than a passive connect button.

That includes:

- wallet-first onboarding
- transaction preview before signature
- signing flow support for deposits, repays, and position changes
- mobile-friendly interaction patterns

Reference:

- https://docs.solflare.com/solflare

## QuickNode

QuickNode powers the live state layer of the app.

That includes:

- low-latency wallet and account reads
- responsive transaction status updates
- fresher position refreshes
- an activity rail that feels operational instead of static

Reference:

- https://www.quicknode.com/chains/sol

## Optional extension

If the product later needs asset routing before entering or adjusting a target position, DFlow can support an execution path for swaps and rebalances. The current core product stays focused on wallet visibility, Kamino positioning, and action clarity.

Reference:

- https://pond.dflow.net/build/introduction
