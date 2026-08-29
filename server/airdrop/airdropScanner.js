import {
  addAirdrops,
  getAirdropDatabaseStats,
} from "./airdropDatabase.js";

import {
  discoverDeFiLlamaAirdrops,
} from "./sources/defillama.js";

import {
  scanWalletWithDrops,
} from "./sources/drops.js";

let lastScan = null;

/**
 * TokenOS Airdrop Scanner
 *
 * Discovery kaynaklarını tek yerde birleştirir.
 *
 * Kaynaklar:
 * - DeFiLlama
 * - Drops
 *
 * Daha sonra:
 * - Token terminal / claim APIs
 * - protocol-specific sources
 * - on-chain eligibility
 * eklenebilir.
 */

export async function scanAirdropSources() {
  console.log("");
  console.log("====================================");
  console.log("🚀 TokenOS Airdrop Scanner");
  console.log("====================================");

  const discovered = [];

  // ---------------------------------
  // DeFiLlama
  // ---------------------------------

  try {
    console.log("🔎 DeFiLlama taranıyor...");

    const result =
      await discoverDeFiLlamaAirdrops();

    if (
      result.success &&
      Array.isArray(result.airdrops)
    ) {
      discovered.push(
        ...result.airdrops
      );

      console.log(
        `✅ DeFiLlama: ${result.airdrops.length} aday`
      );
    } else {
      console.log(
        "⚠️ DeFiLlama sonuç vermedi."
      );
    }
  } catch (error) {
    console.error(
      "❌ DeFiLlama scanner error:",
      error.message
    );
  }

  // ---------------------------------
  // Database
  // ---------------------------------

  const added =
    addAirdrops(discovered);

  const stats =
    getAirdropDatabaseStats();

  lastScan = {
    scannedAt:
      new Date().toISOString(),

    discovered:
      discovered.length,

    added,

    database:
      stats,
  };

  console.log("");
  console.log("📊 Airdrop Scanner:");
  console.log(
    JSON.stringify(
      lastScan,
      null,
      2
    )
  );

  return lastScan;
}

/**
 * Wallet bazlı kaynak taraması.
 */
export async function scanWalletAirdropSources(
  wallet
) {
  if (!wallet) {
    return {
      success: false,
      wallet: null,
      sources: [],
    };
  }

  const sources = [];

  // Drops
  try {
    const drops =
      await scanWalletWithDrops(
        wallet
      );

    sources.push({
      provider: "drops",
      ...drops,
    });
  } catch (error) {
    sources.push({
      provider: "drops",
      success: false,
      error: error.message,
      airdrops: [],
    });
  }

  return {
    success: true,
    wallet,
    scannedAt:
      new Date().toISOString(),
    sources,
  };
}

export function getLastAirdropScan() {
  return lastScan;
}