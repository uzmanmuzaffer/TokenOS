import {
  addAirdrops,
  clearAirdrops,
  getAllAirdrops,
} from "./airdropDatabase.js";

import {
  discoverDeFiLlamaAirdrops,
} from "./sources/defillama.js";

import {
  scanWalletWithDrops,
} from "./sources/drops.js";

export async function refreshAirdropDatabase() {
  console.log("");
  console.log("====================================");
  console.log("🚀 TokenOS Airdrop Discovery");
  console.log("====================================");

  clearAirdrops();

  let discovered = [];

  // ==================================
  // DeFiLlama
  // ==================================

  try {
    console.log(
      "🔎 DeFiLlama taranıyor..."
    );

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
        "⚠️ DeFiLlama sonuç üretmedi."
      );
    }
  } catch (error) {
    console.error(
      "❌ DeFiLlama:",
      error.message
    );
  }

  // ==================================
  // Drops
  // ==================================

  try {
    console.log(
      "🔎 Drops provider kontrol ediliyor..."
    );

    const result =
      await scanWalletWithDrops(
        "0x0000000000000000000000000000000000000000"
      );

    if (
      result.success &&
      Array.isArray(result.airdrops)
    ) {
      discovered.push(
        ...result.airdrops
      );

      console.log(
        `✅ Drops: ${result.airdrops.length} kayıt`
      );
    } else {
      console.log(
        `ℹ️ Drops: ${
          result.error ||
          "configured değil"
        }`
      );
    }
  } catch (error) {
    console.error(
      "❌ Drops:",
      error.message
    );
  }

  // ==================================
  // Database
  // ==================================

  const added =
    addAirdrops(discovered);

  const database =
    getAllAirdrops();

  console.log("");
  console.log(
    `📊 Discovery: ${discovered.length}`
  );

  console.log(
    `💾 Database: ${database.length}`
  );

  console.log(
    `➕ Processed: ${added}`
  );

  console.log(
    "===================================="
  );

  return database;
}