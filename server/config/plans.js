export const BILLING_CURRENCY = "USDC";
export const BILLING_CHAIN = "base";
export const REFERRAL_COMMISSION_RATE = 0.2;
export const REFERRAL_WINDOW_MONTHS = 12;

export const PLANS = {
  free: {
    id: "free",
    name: "Explorer",
    priceUsd: 0,
    interval: "month",
    badge: "Start free",
    description: "Public research scans. Enough to evaluate a wallet before you interact.",
    limits: {
      scansPerDay: 8,
      aiBriefsPerDay: 2,
      airdropScansPerDay: 2,
      watchlists: 0,
      apiRequestsPerMonth: 0,
      seats: 1,
      exportCsv: false,
      webhooks: false,
      priorityQueue: false,
    },
    features: [
      "8 wallet scans / day",
      "2 AI briefs / day",
      "Basic risk score",
      "Supported EVM chains",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Desk",
    priceUsd: 19,
    interval: "month",
    badge: "Most used",
    description: "For active researchers who scan wallets daily and need the full briefing.",
    limits: {
      scansPerDay: 200,
      aiBriefsPerDay: 80,
      airdropScansPerDay: 40,
      watchlists: 25,
      apiRequestsPerMonth: 0,
      seats: 1,
      exportCsv: true,
      webhooks: false,
      priorityQueue: false,
    },
    features: [
      "200 scans / day",
      "80 AI briefs / day",
      "Full Airdrop Radar",
      "CSV export",
      "Saved watchlists",
    ],
  },
  desk: {
    id: "desk",
    name: "Research Desk",
    priceUsd: 79,
    interval: "month",
    badge: "Teams & bots",
    description: "API access and higher ceilings for desks, bots and power users.",
    limits: {
      scansPerDay: 2000,
      aiBriefsPerDay: 400,
      airdropScansPerDay: 200,
      watchlists: 200,
      apiRequestsPerMonth: 20000,
      seats: 5,
      exportCsv: true,
      webhooks: true,
      priorityQueue: true,
    },
    features: [
      "2,000 scans / day",
      "20,000 API calls / month",
      "Webhooks",
      "5 seats",
      "Priority queue",
    ],
  },
};

export const ADD_ONS = {
  deep_report: {
    id: "deep_report",
    name: "Deep AI report",
    priceUsd: 0.99,
    currency: BILLING_CURRENCY,
    description: "One-off premium wallet brief billed over x402 / USDC.",
  },
};

export function getPlan(planId = "free") {
  return PLANS[planId] || PLANS.free;
}

export function listPublicPlans() {
  return Object.values(PLANS);
}