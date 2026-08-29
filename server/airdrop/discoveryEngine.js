import {
  addAirdrops,
  getAllAirdrops,
} from "./airdropDatabase.js";

import {
  discoverDeFiLlamaAirdrops,
} from "./sources/defillama.js";

function normalizeProjectName(
  project,
  url
) {
  const name =
    String(project || "")
      .trim();

  if (
    name &&
    name.toLowerCase() !==
      "open in new tab" &&
    name.toLowerCase() !==
      "airdrop"
  ) {
    return name;
  }

  try {
    const hostname =
      new URL(url).hostname
        .replace(/^www\./, "");

    const parts =
      hostname.split(".");

    if (parts.length >= 2) {
      return parts[
        parts.length - 2
      ]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, c =>
          c.toUpperCase()
        );
    }

    return hostname;
  } catch {
    return "Unknown Project";
  }
}

function normalizeDiscoveryItem(
  item
) {
  const claimUrl =
    item.claim?.url ||
    item.discovery?.url ||
    null;

  const project =
    normalizeProjectName(
      item.project,
      claimUrl
    );

  const id =
    item.id ||
    `discovered-${Buffer
      .from(
        `${project}:${claimUrl || ""}`
      )
      .toString("hex")
      .slice(0, 24)}`;

  return {
    ...item,

    id,

    project,

    status:
      item.status ||
      "potential",

    claim: {
      isLive:
        Boolean(
          item.claim?.isLive
        ),

      start:
        item.claim?.start ||
        null,

      end:
        item.claim?.end ||
        null,

      url:
        claimUrl,
    },

    chains:
      Array.isArray(item.chains)
        ? item.chains
        : [],

    token: {
      symbol:
        item.token?.symbol ||
        "UNKNOWN",

      contract:
        item.token?.contract ||
        "",

      decimals:
        Number(
          item.token?.decimals ??
          18
        ),
    },

    allocation: {
      total:
        Number(
          item.allocation?.total ||
          0
        ),

      claimed:
        Number(
          item.allocation?.claimed ||
          0
        ),
    },

    pricing: {
      usd:
        Number(
          item.pricing?.usd ||
          0
        ),

      source:
        item.pricing?.source ||
        null,
    },

    verified:
      Boolean(item.verified),

    lastVerified:
      item.lastVerified ||
      null,

    metadata: {
      ...(item.metadata || {}),

      discoverySource:
        "defillama",

      discoveryUrl:
        item.sources?.[0]?.url ||
        "https://defillama.com/airdrop-directory",
    },
  };
}

/**
 * Tüm discovery kaynaklarını çalıştırır.
 */
export async function discoverAllAirdrops() {
  console.log(
    "======================================"
  );

  console.log(
    "🚀 TokenOS Airdrop Discovery Engine"
  );

  console.log(
    "======================================"
  );

  const discovered = [];

  // ===============================
  // DeFiLlama
  // ===============================

  try {
    const result =
      await discoverDeFiLlamaAirdrops();

    if (
      result.success &&
      Array.isArray(
        result.airdrops
      )
    ) {
      discovered.push(
        ...result.airdrops
          .map(
            normalizeDiscoveryItem
          )
      );

      console.log(
        `✅ DeFiLlama: ${result.airdrops.length} aday`
      );
    } else {
      console.log(
        "⚠️ DeFiLlama discovery başarısız."
      );
    }
  } catch (error) {
    console.error(
      "❌ DeFiLlama error:",
      error.message
    );
  }

  // ===============================
  // Deduplicate
  // ===============================

  const unique =
    new Map();

  for (
    const airdrop of discovered
  ) {
    const key =
      (
        airdrop.claim?.url ||
        `${airdrop.project}:${airdrop.id}`
      )
        .toLowerCase()
        .trim();

    if (!unique.has(key)) {
      unique.set(
        key,
        airdrop
      );
    }
  }

  const normalized =
    Array.from(
      unique.values()
    );

  // ===============================
  // Database
  // ===============================

  const added =
    addAirdrops(
      normalized
    );

  const database =
    getAllAirdrops();

  console.log(
    `💾 Database kayıtları: ${database.length}`
  );

  console.log(
    `➕ İşlenen kayıt: ${added}`
  );

  return {
    success: true,

    discovered:
      normalized.length,

    added,

    total:
      database.length,

    airdrops:
      database,
  };
}