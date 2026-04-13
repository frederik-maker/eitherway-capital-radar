const MODES = [
  {
    id: "income",
    label: "Income",
    walletValue: "$82,460",
    idleCapital: "$18,200",
    blendedYield: "8.7%",
    riskBuffer: "Healthy",
    nextMove: "Deploy idle USDC into Kamino Earn",
    actionHeadline: "Deploy idle USDC",
    actionBody:
      "Put idle balance to work in Kamino without adding leverage or directional exposure.",
    yieldDelta: "+2.1%",
    riskImpact: "No added leverage",
    previewAction: "Deposit USDC to Kamino Earn",
    previewOutcome: "Idle balance drops, blended APY rises"
  },
  {
    id: "balanced",
    label: "Balanced",
    walletValue: "$82,460",
    idleCapital: "$11,800",
    blendedYield: "10.4%",
    riskBuffer: "Stable",
    nextMove: "Rebalance SOL-heavy vault exposure",
    actionHeadline: "Reduce concentration",
    actionBody:
      "Trim concentrated SOL exposure and redistribute capital across steadier Kamino yield sources.",
    yieldDelta: "+1.3%",
    riskImpact: "Lower drawdown risk",
    previewAction: "Reallocate across Kamino vaults",
    previewOutcome: "Smoother yield, lower concentration risk"
  },
  {
    id: "defensive",
    label: "Defensive",
    walletValue: "$82,460",
    idleCapital: "$9,400",
    blendedYield: "7.9%",
    riskBuffer: "Watch closely",
    nextMove: "Repay the riskiest borrow leg",
    actionHeadline: "Repay risky borrow",
    actionBody:
      "Use available stablecoins to widen the liquidation buffer before volatility becomes the story.",
    yieldDelta: "-0.6%",
    riskImpact: "Health improves materially",
    previewAction: "Repay borrow through Solflare",
    previewOutcome: "Liquidation distance increases"
  }
];

const POSITIONS = [
  {
    name: "USDC Earn Vault",
    meta: "Kamino Earn",
    value: "$24,100",
    apy: "8.9%",
    health: "Low risk",
    status: "Productive"
  },
  {
    name: "SOL Collateral Loop",
    meta: "Kamino Lend + Borrow",
    value: "$31,650",
    apy: "11.4%",
    health: "Moderate risk",
    status: "Needs monitoring"
  },
  {
    name: "Idle Stablecoin Buffer",
    meta: "Wallet cash",
    value: "$18,200",
    apy: "0.0%",
    health: "No protocol risk",
    status: "Underutilized"
  }
];

const EVENTS = [
  {
    title: "QuickNode: wallet balances refreshed",
    meta: "2 seconds ago"
  },
  {
    title: "Kamino vault APY changed by +0.3%",
    meta: "45 seconds ago"
  },
  {
    title: "Transaction confirmation received",
    meta: "3 minutes ago"
  },
  {
    title: "Solflare signing flow ready",
    meta: "Live on mainnet"
  }
];

const metricRow = document.getElementById("metricRow");
const modeButtons = document.getElementById("modeButtons");
const positionList = document.getElementById("positionList");
const eventList = document.getElementById("eventList");

const refs = {
  walletValue: document.getElementById("walletValue"),
  nextMove: document.getElementById("nextMove"),
  idleCapital: document.getElementById("idleCapital"),
  blendedYield: document.getElementById("blendedYield"),
  riskBuffer: document.getElementById("riskBuffer"),
  actionHeadline: document.getElementById("actionHeadline"),
  actionBody: document.getElementById("actionBody"),
  yieldDelta: document.getElementById("yieldDelta"),
  riskImpact: document.getElementById("riskImpact"),
  previewAction: document.getElementById("previewAction"),
  previewOutcome: document.getElementById("previewOutcome")
};

let activeMode = MODES[0];

function renderMetrics() {
  metricRow.innerHTML = [
    ["Idle capital", activeMode.idleCapital],
    ["Blended APY", activeMode.blendedYield],
    ["Next move", activeMode.nextMove]
  ]
    .map(
      ([label, value]) => `
        <div class="metric-tile">
          <p class="label">${label}</p>
          <p class="value-small">${value}</p>
        </div>
      `
    )
    .join("");
}

function renderModes() {
  modeButtons.innerHTML = MODES.map(
    (mode) => `
      <button
        type="button"
        class="mode-button ${mode.id === activeMode.id ? "active" : ""}"
        data-mode="${mode.id}"
      >
        ${mode.label}
      </button>
    `
  ).join("");

  modeButtons.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMode = MODES.find((mode) => mode.id === button.dataset.mode) || MODES[0];
      renderAll();
    });
  });
}

function renderPositions() {
  positionList.innerHTML = POSITIONS.map(
    (position) => `
      <div class="position-row">
        <div>
          <p class="position-title">${position.name}</p>
          <p class="position-meta">${position.meta}</p>
        </div>
        <div>
          <p class="label">Value</p>
          <p class="value-small">${position.value}</p>
        </div>
        <div>
          <p class="label">Yield</p>
          <p class="value-small">${position.apy}</p>
        </div>
        <div>
          <p class="label">Health</p>
          <p class="value-small">${position.health}</p>
        </div>
        <div>
          <p class="label">Status</p>
          <p class="value-small">${position.status}</p>
        </div>
      </div>
    `
  ).join("");
}

function renderEvents() {
  eventList.innerHTML = EVENTS.map(
    (event) => `
      <div class="event-row">
        <div>
          <p class="event-title">${event.title}</p>
          <p class="event-meta">${event.meta}</p>
        </div>
      </div>
    `
  ).join("");
}

function renderModeState() {
  refs.walletValue.textContent = activeMode.walletValue;
  refs.nextMove.textContent = activeMode.nextMove;
  refs.idleCapital.textContent = activeMode.idleCapital;
  refs.blendedYield.textContent = activeMode.blendedYield;
  refs.riskBuffer.textContent = activeMode.riskBuffer;
  refs.actionHeadline.textContent = activeMode.actionHeadline;
  refs.actionBody.textContent = activeMode.actionBody;
  refs.yieldDelta.textContent = activeMode.yieldDelta;
  refs.riskImpact.textContent = activeMode.riskImpact;
  refs.previewAction.textContent = activeMode.previewAction;
  refs.previewOutcome.textContent = activeMode.previewOutcome;
}

function renderAll() {
  renderMetrics();
  renderModes();
  renderPositions();
  renderEvents();
  renderModeState();
}

renderAll();

