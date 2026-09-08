
import { CHAINS } from "../config/chains.js";
import { getEvmWallet } from "../providers/evm/index.js";
import { getArcWallet } from "../providers/arc/index.js";
import { getTokenMarketData } from "../services/tokenPrice.js";

/**
 * TokenOS Multi-Chain Wallet Engine
 *
 * EVM:
 * - Alchemy / public provider
 * - DexScreener market enrichment
 *
 * Arc:
 * - Arc RPC
 * - Native USDC
 * - No external price lookup for native USDC
 */

/**
 * Enrich normal EVM token prices.
 *
 * Arc native USDC is already priced by the Arc provider
 * and must not be sent through DexScreener.
 */
async function enrichTokenPrices(tokens = [], chain) {
  return Promise.all(
    tokens.map(async (token) => {
      /*
       * Arc native USDC already has an authoritative
       * price/value from the Arc provider.
       */
      if (
        chain === "arc" &&
        token?.isNative === true &&
        token?.isUSDC === true
      ) {
        return {
          ...token,

          price: Number(token?.price || 1),

          usd_price:
            Number(token?.usd_price || 1),

          usdValue:
            Number(token?.usdValue || 0),

          priceSource:
            token?.priceSource ||
            "arc-native-usdc",

          valuationStatus:
            "priced",
        };
      }

      const address =
        token?.token_address ||
        token?.address ||
        "";

      /*
       * Tokens without contract addresses cannot
       * be priced through DexScreener.
       */
      if (!address) {
        return {
          ...token,

          price: Number(token?.price || 0),

          usd_price:
            Number(token?.usd_price || 0),

          usdValue:
            Number(token?.usdValue || 0),

          priceSource:
            token?.priceSource ||
            "none",

          valuationStatus:
            token?.valuationStatus ||
            "unpriced",
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

              case "arc":
                result =
                  await getArcWallet(
                    wallet
                  );
                break;

              default:
                result = {
                  success: false,

                  chain:
                    chain.name,

                  chainId:
                    chain.id,

                  tokenCount: 0,

                  tokens: [],

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

                  chainId:
                    chain.id,

                  tokenCount: 0,

                  tokens: [],

                  error:
                    "Empty provider response",
                }
              );
            }

            /*
             * Market enrichment:
             *
             * - Existing EVM chains → DexScreener
             * - Arc native USDC → keep Arc provider value
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

