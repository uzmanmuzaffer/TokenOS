import { CHAINS } from "../config/chains.js";
import { getEvmWallet } from "../providers/evm/index.js";

export async function analyzeWallet(wallet) {
  const results = [];

  for (const chain of CHAINS) {
    if (!chain.enabled) continue;

    try {
      let result = null;

      switch (chain.type) {
        case "evm":
          result = await getEvmWallet(wallet, chain);
          break;

        default:
          result = {
            success: false,
            chain: chain.name,
            error: "Provider not implemented",
          };
      }

      results.push(result);

    } catch (error) {

      results.push({
        success: false,
        chain: chain.name,
        error: error.message,
      });

    }
  }

  return results;
}