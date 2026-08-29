import {
  getAllAirdrops,
} from "./airdropDatabase.js";

import {
  calculateAirdropValue,
} from "./valuationEngine.js";

import {
  evaluateEligibility,
} from "./eligibilityEngine.js";

/**
 * TokenOS Airdrop Engine
 *
 * Wallet-aware airdrop analysis.
 *
 * Status:
 * - claimable
 * - already_received
 * - eligible_unpriced
 * - likely
 * - potential
 * - unlikely
 * - not_eligible
 * - expired
 */

function normalizeNumber(value) {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

function normalizeAddress(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
}

function getWalletChains(walletData) {
  return Array.isArray(walletData?.chains)
    ? walletData.chains
    : [];
}

function getAirdropChains(airdrop) {
  return Array.isArray(airdrop?.chains)
    ? airdrop.chains
    : [];
}

function isChainMatch(airdrop, walletData) {
  const airdropChains =
    getAirdropChains(airdrop);

  if (airdopChainsEmpty(aidropChains)) {
    return true;
  }

  const walletChains =
    getWalletChains(walletData)
      .map((chain) =>
        String(chain).toLowerCase()
      );

  return airdropChains.some(
    (chain) =>
      walletChains.includes(
        String(chain).toLowerCase()
      )
  );
}

function airdopChainsEmpty(chains) {
  return !Array.isArray(chains) ||
    chains.length === 0;
}

/**
 * Wallet token lookup.
 */
function getWalletToken(
  airdrop,
  walletData
) {
  const contract =
    normalizeAddress(
      airdrop?.token?.contract
    );

  if (!contract) {
    return null;
  }

  const tokens =
    Array.isArray(
      walletData?.tokens
    )
      ? walletData.tokens
      : [];

  return (
    tokens.find(
      (token) =>
        normalizeAddress(
          token?.token_address
        ) === contract
    ) || null
  );
}

/**
 * Wallet balance for an airdrop token.
 */
function getWalletTokenBalance(
  airdrop,
  walletData
) {
  const token =
    getWalletToken(
      airdrop,
      walletData
    );

  if (!token) {
    return 0;
  }

  const formatted =
    normalizeNumber(
      token.balance_formatted
    );

  if (formatted > 0) {
    return formatted;
  }

  const raw =
    normalizeNumber(
      token.balance
    );

  const decimals =
    normalizeNumber(
      token.decimals ?? 18
    );

  if (raw <= 0) {
    return 0;
  }

  return (
    raw /
    Math.pow(10, decimals)
  );
}

/**
 * Wallet-specific allocation.
 *
 * Project endpoint / external scanner
 * tarafından sağlanan miktarları kullanır.
 */
function getWalletAirdropAmount(
  airdrop,
  walletData
) {
  const candidates = [
    walletData?.airdropAllocations?.[
      airdrop.id
    ],

    walletData?.airdropAmounts?.[
      airdrop.id
    ],

    walletData?.airdrops?.[
      airdrop.id
    ],
  ];

  for (const value of candidates) {
    const amount =
      normalizeNumber(value);

    if (amount > 0) {
      return amount;
    }
  }

  return 0;
}

/**
 * Genel allocation.
 *
 * Bu değer wallet-specific değildir.
 */
function getKnownRemainingAllocation(
  airdrop
) {
  const total =
    normalizeNumber(
      airdrop?.allocation?.total
    );

  const claimed =
    normalizeNumber(
      airdrop?.allocation?.claimed
    );

  if (total <= 0) {
    return 0;
  }

  return Math.max(
    0,
    total - claimed
  );
}

/**
 * Gerçek claimable miktar.
 */
function getClaimableAmount(
  airdrop,
  walletData,
  eligibility
) {
  if (!eligibility?.eligible) {
    return 0;
  }

  if (!airdrop?.claim?.isLive) {
    return 0;
  }

  return getWalletAirdropAmount(
    airdrop,
    walletData
  );
}

/**
 * Tek airdrop analizi.
 */
function analyzeAirdrop(
  airdrop,
  walletData
) {
  const eligibility =
    evaluateEligibility(
      airdrop,
      walletData
    );

  const chainMatch =
    isChainMatch(
      airdrop,
      walletData
    );

  const walletAllocation =
    getWalletAirdropAmount(
      airdrop,
      walletData
    );

  const walletTokenBalance =
    getWalletTokenBalance(
      airdrop,
      walletData
    );

  const claimableAmount =
    getClaimableAmount(
      airdrop,
      walletData,
      eligibility
    );

  /**
   * Claimable miktar varsa onu değerlendir.
   * Aksi halde mevcut token balance,
   * "already received" kanıtı olarak tutulur.
   */
  const valuationAmount =
    claimableAmount > 0
      ? claimableAmount
      : walletTokenBalance;

  const valuation =
    calculateAirdropValue({
      ...airdrop,

      allocation: {
        ...airdrop.allocation,

        total:
          valuationAmount,

        claimed: 0,
      },
    });

  let status =
    eligibility.status;

  /**
   * Gerçek claimable.
   */
  if (
    eligibility.eligible &&
    airdrop.claim?.isLive &&
    claimableAmount > 0
  ) {
    status = "claimable";
  }

  /**
   * Cüzdanda airdrop tokenı mevcut.
   *
   * Bu durumda kullanıcı daha önce tokenı
   * almış olabilir.
   */
  else if (
    walletTokenBalance > 0 &&
    claimableAmount === 0
  ) {
    status =
      "already_received";
  }

  /**
   * Kriterler tam fakat miktar bilinmiyor.
   */
  else if (
    eligibility.eligible &&
    airdrop.claim?.isLive
  ) {
    status =
      "eligible_unpriced";
  }

  else if (
    eligibility.status === "likely"
  ) {
    status = "likely";
  }

  const reasons = [
    ...(eligibility.reasons || []),
  ];

  if (!chainMatch) {
    reasons.push(
      "Wallet does not show activity on the required chain."
    );
  }

  if (
    walletTokenBalance > 0
  ) {
    reasons.push(
      `Wallet currently holds approximately ${walletTokenBalance} ${airdrop.token?.symbol || ""}.`
    );
  }

  if (
    status === "already_received"
  ) {
    reasons.push(
      "The airdrop token contract was found in the wallet."
    );
  }

  if (
    eligibility.eligible &&
    airdrop.claim?.isLive &&
    claimableAmount === 0 &&
    walletTokenBalance === 0
  ) {
    reasons.push(
      "Eligibility is confirmed, but wallet-specific allocation is not available."
    );
  }

  return {
    id:
      airdrop.id,

    project:
      airdrop.project,

    token:
      airdrop.token,

    chains:
      airdrop.chains,

    status,

    claim:
      airdrop.claim,

    eligibility: {
      ...eligibility,

      chainMatch,
    },

    walletAllocation: {
      amount:
        walletAllocation,

      known:
        walletAllocation > 0,

      source:
        walletAllocation > 0
          ? "wallet-specific"
          : null,
    },

    walletTokenBalance: {
      amount:
        walletTokenBalance,

      found:
        walletTokenBalance > 0,

      contract:
        airdrop.token?.contract ||
        null,
    },

    knownRemainingAllocation:
      getKnownRemainingAllocation(
        airdrop
      ),

    valuation,

    verified:
      Boolean(
        airdrop.verified
      ),

    sources:
      airdrop.sources || [],

    lastVerified:
      airdrop.lastVerified ||
      null,

    detection: {
      tokenContractMatched:
        walletTokenBalance > 0,

      walletSpecificAllocationKnown:
        walletAllocation > 0,

      claimableAmountKnown:
        claimableAmount > 0,
    },
  };
}

/**
 * Tüm bilinen airdrop fırsatları.
 */
export function getAirdropOpportunities() {
  const airdrops =
    getAllAirdrops();

  return airdrops.map(
    (airdrop) => ({
      ...airdrop,

      valuation:
        calculateAirdropValue(
          airdrop
        ),
    })
  );
}

/**
 * Wallet + Airdrop database scanner.
 */
export function scanWalletForAirdrops(
  walletData
) {
  const airdrops =
    getAllAirdrops();

  const results =
    airdrops.map(
      (airdrop) =>
        analyzeAirdrop(
          airdrop,
          walletData
        )
    );

  /**
   * GERÇEK claimable.
   */
  const claimable =
    results.filter(
      (item) =>
        item.status === "claimable" &&
        item.walletAllocation?.amount > 0
    );

  /**
   * Cüzdanda token mevcut.
   */
  const alreadyReceived =
    results.filter(
      (item) =>
        item.status ===
        "already_received"
    );

  /**
   * Eligibility kesin ama miktar yok.
   */
  const eligibleUnpriced =
    results.filter(
      (item) =>
        item.status ===
        "eligible_unpriced"
    );

  /**
   * Potansiyel.
   */
  const potential =
    results.filter(
      (item) =>
        item.status === "potential" ||
        item.status === "likely"
    );

  const expired =
    results.filter(
      (item) =>
        item.status === "expired"
    );

  const notEligible =
    results.filter(
      (item) =>
        item.status === "not_eligible"
    );

  /**
   * Claimable USD.
   */
  const claimableUsd =
    claimable.reduce(
      (sum, item) =>
        sum +
        normalizeNumber(
          item.valuation?.usdValue
        ),
      0
    );

  /**
   * Already received USD.
   */
  const alreadyReceivedUsd =
    alreadyReceived.reduce(
      (sum, item) =>
        sum +
        normalizeNumber(
          item.valuation?.usdValue
        ),
      0
    );

  /**
   * Potential USD.
   */
  const potentialUsd =
    potential.reduce(
      (sum, item) =>
        sum +
        (
          item.walletAllocation?.known
            ? normalizeNumber(
                item.valuation?.usdValue
              )
            : 0
        ),
      0
    );

  /**
   * Sadece gerçek claimable.
   */
  const confirmedTotalUsd =
    claimableUsd;

  /**
   * Kullanıcının zaten aldığı tokenlar
   * ayrı tutulur.
   */
  const receivedTotalUsd =
    alreadyReceivedUsd;

  return {
    wallet:
      walletData?.wallet ||
      null,

    scannedAt:
      new Date().toISOString(),

    summary: {
      totalFound:
        results.length,

      claimable:
        claimable.length,

      alreadyReceived:
        alreadyReceived.length,

      eligibleUnpriced:
        eligibleUnpriced.length,

      potential:
        potential.length,

      expired:
        expired.length,

      notEligible:
        notEligible.length,

      claimableUsd:
        Number(
          claimableUsd.toFixed(2)
        ),

      alreadyReceivedUsd:
        Number(
          alreadyReceivedUsd.toFixed(2)
        ),

      potentialUsd:
        Number(
          potentialUsd.toFixed(2)
        ),

      confirmedTotalUsd:
        Number(
          confirmedTotalUsd.toFixed(2)
        ),

      receivedTotalUsd:
        Number(
          receivedTotalUsd.toFixed(2)
        ),

      totalKnownUsd:
        Number(
          (
            claimableUsd +
            alreadyReceivedUsd +
            potentialUsd
          ).toFixed(2)
        ),
    },

    results,
  };
}