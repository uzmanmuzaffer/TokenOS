
import { CHAINS } from "../config/chains.js";
import { getEvmWallet } from "../providers/evm/index.js";
import { getTokenMarketData } from "../services/tokenPrice.js";

/**
 * TokenOS Multi-Chain Wallet Engine
 *
 * Alchemy:
 * - wallet tokenlerini getirir
 *
 * DexScreener:
 * - token fiyatlarını getirir
 *
 * Portfolio:
 * - balance × price hesaplar
 */

async function enrichTokenPrices(tokens = [], chain) {
  return Promise.all(
    tokens.map(async (token) => {
      const address =
        token?.token_address ||
        token?.address ||
        "";

      if (!address) {
        return {
          ...token,
          price: 0,
          usd_price: 0,
          usdValue: 0,
          priceSource: "none",
          valuationStatus: "unpriced",
        };
      }

      try {
        const market =
          await getTokenMarketData(
            address,
            chain
          );

        const price =
          Number(
            market?.priceUsd || 0
          );

        const balance =
          Number(
            token?.balance_formatted || 0
          );

        const usdValue =
          price > 0
            ? Number(
                (
                  balance * price
                ).toFixed(2)
              )
            : 0;

        return {
          ...token,

          price,
          usd_price: price,

          usdValue,

          liquidityUsd:
            Number(
              market?.liquidityUsd || 0
            ),

          volume24h:
            Number(
              market?.volume24h || 0
            ),

          fdv:
            Number(
              market?.fdv || 0
            ),

          marketCap:
            Number(
              market?.marketCap || 0
            ),

          dex:
            market?.dex || null,

          pair:
            market?.pair || null,

          pairName:
            market?.pairName || null,

          priceSource:
            market?.source || "none",

          priceConfidence:
            market?.confidence || "none",

          priceChain:
            market?.priceChain || chain,

          valuationStatus:
            price > 0
              ? "priced"
              : "unpriced",
        };
      } catch (error) {
        console.warn(
          `⚠️ Price failed ${chain}/${address}:`,
          error?.message
        );

        return {
          ...token,

          price: 0,
          usd_price: 0,
          usdValue: 0,

          priceSource: "none",
          priceConfidence: "none",
          priceChain: chain,

          valuationStatus:
            "unpriced",
        };
      }
    })
  );
}

export async function analyzeWallet(wallet) {
  if (
    !wallet ||
    typeof wallet !== "string"
  ) {
    return [
      {
        success: false,
        error:
          "Valid wallet address is required",
      },
    ];
  }

  const activeChains =
    CHAINS.filter(
      (chain) => chain.enabled
    );

  if (
    activeChains.length === 0
  ) {
    return [];
  }

  const results =
    await Promise.allSettled(
      activeChains.map(
        async (chain) => {
          try {
            let result;

            switch (chain.type) {
              case "evm":
                result =
                  await getEvmWallet(
                    wallet,
                    chain
                  );
                break;

              default:
                result = {
                  success: false,
                  chain:
                    chain.name,
                  error:
                    "Provider not implemented",
                };
            }

            if (
              !result ||
              !result.success
            ) {
              return (
                result || {
                  success: false,
                  chain:
                    chain.name,
                  error:
                    "Empty provider response",
                }
              );
            }

            /*
             * Alchemy tokenlerini
             * DexScreener fiyatlarıyla
             * zenginleştir.
             */
            const pricedTokens =
              await enrichTokenPrices(
                result.tokens || [],
                chain.id
              );

            return {
              ...result,

              tokens:
                pricedTokens,

              tokenCount:
                pricedTokens.length,
            };
          } catch (error) {
            return {
              success: false,

              chain:
                chain.name,

              chainId:
                chain.id,

              tokenCount: 0,

              tokens: [],

              error:
                error?.message ||
                "Unknown provider error",
            };
          }
        }
      )
    );

  return results.map(
    (result, index) => {
      const chain =
        activeChains[index];

      if (
        result.status ===
        "fulfilled"
      ) {
        return result.value;
      }

      return {
        success: false,

        chain:
          chain.name,

        chainId:
          chain.id,

        tokenCount: 0,

        tokens: [],

        error:
          result.reason?.message ||
          "Chain analysis failed",
      };
    }
  );
}

