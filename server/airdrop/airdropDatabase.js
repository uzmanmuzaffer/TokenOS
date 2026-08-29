/**
 * TokenOS Airdrop Database
 *
 * Runtime discovery database.
 * Sources -> normalize -> database -> radar
 */

const AIRDROPS = new Map();

export function addAirdrop(airdrop) {
  if (!airdrop || !airdrop.id) {
    return false;
  }

  const normalized = normalizeAirdrop(airdrop);

  const existing = AIRDROPS.get(normalized.id);

  if (existing) {
    AIRDROPS.set(normalized.id, {
      ...existing,
      ...normalized,
      token: {
        ...existing.token,
        ...normalized.token,
      },
      claim: {
        ...existing.claim,
        ...normalized.claim,
      },
      allocation: {
        ...existing.allocation,
        ...normalized.allocation,
      },
      eligibility: {
        ...existing.eligibility,
        ...normalized.eligibility,
      },
      pricing: {
        ...existing.pricing,
        ...normalized.pricing,
      },
      sources:
        normalized.sources.length > 0
          ? normalized.sources
          : existing.sources,
    });

    return true;
  }

  AIRDROPS.set(
    normalized.id,
    normalized
  );

  return true;
}

export function addAirdrops(airdrops = []) {
  if (!Array.isArray(airdrops)) {
    return 0;
  }

  let added = 0;

  for (const airdrop of airdrops) {
    if (addAirdrop(airdrop)) {
      added++;
    }
  }

  return added;
}

export function getAllAirdrops() {
  return Array.from(
    AIRDROPS.values()
  );
}

export function getAirdropById(id) {
  if (!id) {
    return null;
  }

  return AIRDROPS.get(id) || null;
}

export function getActiveAirdrops() {
  return getAllAirdrops().filter(
    (airdrop) =>
      airdrop.status !== "expired"
  );
}

export function getClaimableAirdrops() {
  return getAllAirdrops().filter(
    (airdrop) =>
      airdrop.claim?.isLive === true
  );
}

export function clearAirdrops() {
  AIRDROPS.clear();
}

export function getAirdropDatabaseStats() {
  const airdrops =
    getAllAirdrops();

  return {
    total: airdrops.length,

    verified:
      airdrops.filter(
        (item) => item.verified
      ).length,

    claimable:
      airdrops.filter(
        (item) =>
          item.claim?.isLive === true
      ).length,

    potential:
      airdrops.filter(
        (item) =>
          item.status === "potential"
      ).length,

    expired:
      airdrops.filter(
        (item) =>
          item.status === "expired"
      ).length,
  };
}

function normalizeAirdrop(airdrop) {
  return {
    id: String(airdrop.id),

    project:
      cleanProjectName(
        airdrop.project,
        airdrop.claim?.url
      ),

    token: {
      symbol:
        airdrop.token?.symbol ||
        "UNKNOWN",

      contract:
        airdrop.token?.contract ||
        "",

      decimals:
        Number(
          airdrop.token?.decimals ?? 18
        ),
    },

    chains:
      Array.isArray(airdrop.chains)
        ? airdrop.chains
        : airdrop.chain
          ? [airdrop.chain]
          : [],

    allocation: {
      total:
        Number(
          airdrop.allocation?.total ??
          airdrop.allocation?.amount ??
          0
        ),

      claimed:
        Number(
          airdrop.allocation?.claimed ??
          0
        ),
    },

    status:
      airdrop.status ||
      "potential",

    claim: {
      isLive:
        Boolean(
          airdrop.claim?.isLive
        ),

      start:
        airdrop.claim?.start ||
        null,

      end:
        airdrop.claim?.end ||
        airdrop.claim?.deadline ||
        null,

      url:
        airdrop.claim?.url ||
        null,
    },

    eligibility: {
      type:
        airdrop.eligibility?.type ||
        "unknown",

      rules:
        Array.isArray(
          airdrop.eligibility?.rules
        )
          ? airdrop.eligibility.rules
          : [],
    },

    sources:
      Array.isArray(airdrop.sources)
        ? airdrop.sources
        : [],

    pricing: {
      usd:
        Number(
          airdrop.pricing?.usd ||
          airdrop.valuation?.usd ||
          0
        ),

      source:
        airdrop.pricing?.source ||
        null,
    },

    verified:
      Boolean(
        airdrop.verified
      ),

    lastVerified:
      airdrop.lastVerified ||
      null,

    metadata:
      airdrop.metadata || {},

    discovery:
      airdrop.discovery || {},
  };
}

function cleanProjectName(
  project,
  url
) {
  const value =
    String(project || "")
      .trim();

  if (
    value &&
    value.toLowerCase() !==
      "open in new tab" &&
    value.toLowerCase() !==
      "unknown"
  ) {
    return value;
  }

  if (!url) {
    return "Unknown Project";
  }

  try {
    const hostname =
      new URL(url).hostname
        .replace(/^www\./, "");

    const parts =
      hostname.split(".");

    if (parts.length >= 2) {
      return capitalize(
        parts[parts.length - 2]
      );
    }

    return capitalize(hostname);
  } catch {
    return "Unknown Project";
  }
}

function capitalize(value) {
  if (!value) {
    return "Unknown Project";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}