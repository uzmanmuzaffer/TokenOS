import { CHAINS } from "../config/chains.js";
import { getEvmWallet } from "../providers/evm/index.js";

/**
 * TokenOS Multi-Chain Wallet Engine
 *
 * Amaç:
 * - Aktif ağları paralel analiz etmek
 * - Bir ağ hata verse bile diğerlerinin çalışmasını sağlamak
 * - Tek bir yavaş ağın bütün analizi bloklamasını önlemek
 */

export async function analyzeWallet(wallet) {
  if (!wallet || typeof wallet !== "string") {
    return [
      {
        success: false,
        error: "Valid wallet address is required",
      },
    ];
  }

  const activeChains = CHAINS.filter(
    (chain) => chain.enabled
  );

  if (activeChains.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    activeChains.map(async (chain) => {
      try {
        let result;

        switch (chain.type) {
          case "evm":
            result = await getEvmWallet(
              wallet,
              chain
            );
            break;

          default:
            result = {
              success: false,
              chain: chain.name,
              error: "Provider not implemented",
            };
        }

        return (
          result || {
            success: false,
            chain: chain.name,
            error: "Empty provider response",
          }
        );
      } catch (error) {
        return {
          success: false,
          chain: chain.name,
          error:
            error?.message ||
            "Unknown provider error",
        };
      }
    })
  );

  return results.map((result, index) => {
    const chain = activeChains[index];

    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      success: false,
      chain: chain.name,
      error:
        result.reason?.message ||
        "Chain analysis failed",
    };
  });
}