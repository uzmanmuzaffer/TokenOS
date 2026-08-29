import axios from "axios";

const DROPS_BASE_URL =
  process.env.DROPS_API_URL ||
  "https://api.drops.bot/shared";

const DROPS_API_KEY =
  process.env.DROPS_API_KEY || "";

function getHeaders() {
  return {
    accept: "application/json",
    "x-api-key": DROPS_API_KEY,
  };
}

/**
 * Drops API adapter
 *
 * Resmi API:
 * https://api.drops.bot/shared
 *
 * API key:
 * DROPS_API_KEY
 */

export function isDropsConfigured() {
  return Boolean(
    DROPS_API_KEY &&
    DROPS_API_KEY.trim()
  );
}

/**
 * Genel GET helper.
 *
 * Endpoint'leri tek yerde topluyoruz.
 * Drops API endpoint isimleri değişirse
 * sadece bu adapter güncellenecek.
 */
async function dropsGet(
  endpoint,
  params = {}
) {
  if (!isDropsConfigured()) {
    return {
      success: false,
      configured: false,
      data: null,
      error:
        "DROPS_API_KEY is not configured.",
    };
  }

  try {
    const response =
      await axios.get(
        `${DROPS_BASE_URL}${endpoint}`,
        {
          params,
          headers: getHeaders(),
          timeout: 15000,
        }
      );

    return {
      success: true,
      configured: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      configured: true,
      data:
        error.response?.data ||
        null,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Drops API request failed.",
      status:
        error.response?.status ||
        null,
    };
  }
}

/**
 * Wallet bazlı airdrop taraması.
 *
 * Endpoint yolu DROPS_WALLET_ENDPOINT
 * environment variable ile değiştirilebilir.
 *
 * Böylece API versiyonu değişirse kodun
 * tamamını değiştirmemiz gerekmez.
 */
export async function scanWalletWithDrops(
  wallet
) {
  if (!wallet) {
    return {
      success: false,
      configured: isDropsConfigured(),
      wallet: null,
      airdrops: [],
      error:
        "Wallet address is required.",
    };
  }

  const endpoint =
    process.env.DROPS_WALLET_ENDPOINT ||
    "/wallet";

  const result =
    await dropsGet(
      endpoint,
      {
        wallet,
      }
    );

  if (!result.success) {
    return {
      success: false,
      configured:
        result.configured,
      wallet,
      airdrops: [],
      error: result.error,
      status:
        result.status || null,
    };
  }

  return {
    success: true,
    configured: true,
    wallet,
    airdrops:
      normalizeDropsResponse(
        result.data
      ),
    raw: result.data,
  };
}

/**
 * Drops API response'unu TokenOS
 * standardına yaklaştırır.
 */
function normalizeDropsResponse(
  data
) {
  if (!data) {
    return [];
  }

  const source =
    Array.isArray(data)
      ? data
      : Array.isArray(data.airdrops)
        ? data.airdrops
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.data)
            ? data.data
            : [];

  return source.map(
    (item, index) => ({
      id:
        item.id ||
        item.slug ||
        `drops-${index}`,

      project:
        item.project ||
        item.protocol ||
        item.name ||
        "Unknown",

      token: {
        symbol:
          item.symbol ||
          item.tokenSymbol ||
          item.token?.symbol ||
          "UNKNOWN",

        contract:
          item.contract ||
          item.tokenAddress ||
          item.token?.contract ||
          "",

        decimals:
          Number(
            item.decimals ||
            item.token?.decimals ||
            18
          ),
      },

      chain:
        item.chain ||
        item.chainName ||
        item.network ||
        null,

      status:
        normalizeStatus(
          item.status ||
          item.state
        ),

      allocation: {
        amount:
          Number(
            item.amount ||
            item.allocation ||
            item.tokenAmount ||
            0
          ),

        claimed:
          Number(
            item.claimed ||
            item.claimedAmount ||
            0
          ),
      },

      valuation: {
        usd:
          Number(
            item.usdValue ||
            item.valueUsd ||
            item.usd ||
            0
          ),
      },

      eligibility: {
        eligible:
          Boolean(
            item.eligible ??
            item.isEligible ??
            false
          ),

        confidence:
          Number(
            item.confidence ||
            0
          ),
      },

      claim: {
        isLive:
          Boolean(
            item.claimable ??
            item.isClaimable ??
            item.claim?.isLive ??
            false
          ),

        url:
          item.claimUrl ||
          item.claim?.url ||
          null,

        deadline:
          item.deadline ||
          item.claimDeadline ||
          item.claim?.end ||
          null,
      },

      verified:
        Boolean(
          item.verified ||
          item.isVerified ||
          false
        ),

      source: "drops",

      raw: item,
    })
  );
}

function normalizeStatus(
  status
) {
  if (!status) {
    return "unknown";
  }

  const value =
    String(status)
      .toLowerCase()
      .trim();

  if (
    [
      "claimable",
      "eligible",
      "live",
    ].includes(value)
  ) {
    return "claimable";
  }

  if (
    [
      "potential",
      "upcoming",
      "active",
    ].includes(value)
  ) {
    return "potential";
  }

  if (
    [
      "claimed",
      "completed",
    ].includes(value)
  ) {
    return "claimed";
  }

  if (
    [
      "expired",
      "ended",
    ].includes(value)
  ) {
    return "expired";
  }

  return "unknown";
}

/**
 * Adapter health check.
 *
 * API key yoksa internet isteği
 * göndermiyoruz.
 */
export async function getDropsStatus() {
  if (!isDropsConfigured()) {
    return {
      available: false,
      configured: false,
      provider: "drops",
      message:
        "DROPS_API_KEY is not configured.",
    };
  }

  return {
    available: true,
    configured: true,
    provider: "drops",
    baseUrl: DROPS_BASE_URL,
  };
}