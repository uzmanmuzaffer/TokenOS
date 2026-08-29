
import axios from "axios";

const TIMEOUT = 15000;

/**
 * TokenOS Wallet Airdrop Scanner
 *
 * Amaç:
 * - Cüzdan adresini alır
 * - Bilinen claim endpointlerini kontrol eder
 * - Wallet-specific allocation bulmaya çalışır
 * - Sonucu standart TokenOS formatına dönüştürür
 *
 * Güvenlik:
 * - Private key istemez
 * - Seed phrase istemez
 * - Transaction göndermez
 * - Wallet imzalamaz
 */

function normalizeNumber(value) {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

function normalizeAddress(wallet) {
  if (!wallet) {
    return null;
  }

  const value =
    String(wallet).trim();

  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return null;
  }

  return value;
}

function normalizeAmount(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "object") {
    return normalizeNumber(
      value.amount ??
      value.claimableAmount ??
      value.allocation ??
      value.tokens
    );
  }

  return normalizeNumber(value);
}

function extractAllocation(data) {
  if (!data) {
    return 0;
  }

  const candidates = [
    data.amount,
    data.claimableAmount,
    data.claimable,
    data.allocation,
    data.eligibleAmount,
    data.tokenAmount,
    data.userAllocation,
    data.walletAllocation,
    data.data?.amount,
    data.data?.claimableAmount,
    data.data?.allocation,
    data.result?.amount,
    data.result?.claimableAmount,
    data.result?.allocation,
  ];

  for (const value of candidates) {
    const amount =
      normalizeAmount(value);

    if (amount > 0) {
      return amount;
    }
  }

  return 0;
}

function extractEligibility(data) {
  if (!data) {
    return false;
  }

  const candidates = [
    data.eligible,
    data.isEligible,
    data.claimable,
    data.canClaim,
    data.data?.eligible,
    data.data?.isEligible,
    data.data?.claimable,
    data.result?.eligible,
    data.result?.isEligible,
  ];

  return candidates.some(
    (value) =>
      value === true ||
      value === "true"
  );
}

async function requestJson(
  url,
  params = {}
) {
  try {
    const response =
      await axios.get(
        url,
        {
          params,
          timeout: TIMEOUT,
          headers: {
            accept:
              "application/json",
            "user-agent":
              "TokenOS-Airdrop-Radar/1.0",
          },
        }
      );

    return {
      success: true,
      status:
        response.status,
      data:
        response.data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      status:
        error.response?.status ||
        null,
      data:
        error.response?.data ||
        null,
      error:
        error.message ||
        "Request failed.",
    };
  }
}

/**
 * Generic claim endpoint checker.
 *
 * Bu fonksiyon herhangi bir endpoint'in
 * wallet query parametresiyle çalışıp
 * çalışmadığını test eder.
 */
export async function checkAirdropEndpoint({
  wallet,
  url,
  project,
  token,
  chain,
}) {
  const normalizedWallet =
    normalizeAddress(wallet);

  if (!normalizedWallet) {
    return {
      success: false,
      project,
      token,
      chain,
      wallet: null,
      eligible: false,
      amount: 0,
      error:
        "Invalid wallet address.",
    };
  }

  if (!url) {
    return {
      success: false,
      project,
      token,
      chain,
      wallet:
        normalizedWallet,
      eligible: false,
      amount: 0,
      error:
        "Claim endpoint is missing.",
    };
  }

  const result =
    await requestJson(
      url,
      {
        wallet:
          normalizedWallet,
      }
    );

  if (!result.success) {
    return {
      success: false,
      project,
      token,
      chain,
      wallet:
        normalizedWallet,
      eligible: false,
      amount: 0,
      status:
        result.status,
      error:
        result.error,
    };
  }

  const amount =
    extractAllocation(
      result.data
    );

  const eligible =
    extractEligibility(
      result.data
    ) ||
    amount > 0;

  return {
    success: true,

    project,

    token,

    chain,

    wallet:
      normalizedWallet,

    eligible,

    amount,

    status:
      result.status,

    raw:
      result.data,
  };
}

/**
 * Airdrop sonucunu TokenOS standardına
 * dönüştürür.
 */
function normalizeResult(
  airdrop,
  scan
) {
  const amount =
    normalizeNumber(
      scan.amount
    );

  return {
    id:
      airdrop.id,

    project:
      airdrop.project,

    token:
      airdrop.token,

    chains:
      airdrop.chains || [],

    wallet:
      scan.wallet,

    status:
      amount > 0
        ? "claimable"
        : scan.eligible
          ? "eligible_unpriced"
          : "unknown",

    eligibility: {
      eligible:
        Boolean(
          scan.eligible
        ),

      confidence:
        amount > 0
          ? 100
          : scan.eligible
            ? 90
            : 0,

      source:
        "project-endpoint",

      reasons:
        amount > 0
          ? [
              "Wallet-specific allocation detected.",
            ]
          : scan.eligible
            ? [
                "Wallet reported as eligible, but allocation amount was not returned.",
              ]
            : [
                "Wallet-specific eligibility was not confirmed.",
              ],
    },

    walletAllocation: {
      amount,

      known:
        amount > 0,
    },

    claim:
      airdrop.claim,

    valuation: {
      amount,

      price:
        normalizeNumber(
          airdrop.pricing?.usd
        ),

      usdValue:
        Number(
          (
            amount *
            normalizeNumber(
              airdrop.pricing?.usd
            )
          ).toFixed(2)
        ),
    },

    verified:
      Boolean(
        airdrop.verified
      ),

    sources:
      airdrop.sources || [],

    scanner: {
      source:
        "walletAirdropScanner",

      scannedAt:
        new Date().toISOString(),

      endpoint:
        scan.endpoint || null,
    },
  };
}

/**
 * Registry içindeki airdropları
 * wallet bazında tarar.
 *
 * Şimdilik sadece endpoint'i olan
 * gerçek kayıtları tarar.
 */
export async function scanWalletAgainstAirdrops(
  wallet,
  airdrops = []
) {
  const normalizedWallet =
    normalizeAddress(wallet);

  if (!normalizedWallet) {
    throw new Error(
      "Valid EVM wallet address is required."
    );
  }

  const results = [];

  for (const airdrop of airdrops) {
    const endpoint =
      airdrop?.metadata
        ?.walletEndpoint ||
      airdrop?.claim
        ?.walletEndpoint ||
      null;

    if (!endpoint) {
      continue;
    }

    const scan =
      await checkAirdropEndpoint({
        wallet:
          normalizedWallet,

        url:
          endpoint,

        project:
          airdrop.project,

        token:
          airdrop.token?.symbol ||
          "UNKNOWN",

        chain:
          airdrop.chains?.[0] ||
          null,
      });

    scan.endpoint =
      endpoint;

    results.push(
      normalizeResult(
        airdrop,
        scan
      )
    );
  }

  const claimable =
    results.filter(
      (item) =>
        item.status ===
        "claimable"
    );

  const eligibleUnpriced =
    results.filter(
      (item) =>
        item.status ===
        "eligible_unpriced"
    );

  const claimableUsd =
    claimable.reduce(
      (sum, item) =>
        sum +
        normalizeNumber(
          item.valuation?.usdValue
        ),
      0
    );

  return {
    success: true,

    wallet:
      normalizedWallet,

    scannedAt:
      new Date().toISOString(),

    summary: {
      totalScanned:
        results.length,

      claimable:
        claimable.length,

      eligibleUnpriced:
        eligibleUnpriced.length,

      claimableUsd:
        Number(
          claimableUsd.toFixed(2)
        ),
    },

    results,
  };
}

