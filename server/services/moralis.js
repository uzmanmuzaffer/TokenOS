
import axios from "axios";
import { getTokenMarketData } from "./tokenPrice.js";

const BASE_URL =
  "https://deep-index.moralis.io/api/v2.2";

const MAX_TOKENS = 50;

function safeNumber(value, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

export async function getWalletTokens(
  wallet,
  chain = "base"
) {
  const apiKey =
    process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MORALIS_API_KEY not found."
    );
  }

  try {
    console.log(
      "================================"
    );

    console.log(
      "Moralis Wallet Analyzer"
    );

    console.log(
      "Wallet:",
      wallet
    );

    console.log(
      "Chain :",
      chain
    );

    console.log(
      "================================"
    );

    const { data } = await axios.get(
      `${BASE_URL}/${wallet}/erc20`,
      {
        params: {
          chain,
        },

        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },

        timeout: 15000,
      }
    );

    const rawTokens =
      Array.isArray(data)
        ? data
        : [];

    const tokens =
      rawTokens.slice(
        0,
        MAX_TOKENS
      );

    console.log(
      `📦 ${tokens.length} token bulundu`
    );

    /**
     * Token fiyatlarını paralel olarak alıyoruz.
     *
     * Promise.all sayesinde 50 tokenın
     * sırayla beklenmesi engelleniyor.
     */
    const results =
      await Promise.all(
        tokens.map(
          async (token) => {
            try {
              const decimals =
                safeNumber(
                  token.decimals,
                  18
                );

              const rawBalance =
                token.balance ?? "0";

              const formattedBalance =
                Number(rawBalance) /
                Math.pow(
                  10,
                  decimals
                );

              let market = {
                priceUsd: 0,
                liquidityUsd: 0,
                volume24h: 0,
                fdv: 0,
                marketCap: 0,
                dex: null,
                pair: null,
                source: "dexscreener",
                confidence: "none",
                priceChain: chain,
              };

              if (
                token.token_address
              ) {
                market =
                  await getTokenMarketData(
                    token.token_address,
                    chain
                  );
              }

              const price =
                safeNumber(
                  market.priceUsd
                );

              const usdValue =
                price > 0 &&
                Number.isFinite(
                  formattedBalance
                )
                  ? formattedBalance *
                    price
                  : 0;

              return {
                ...token,

                chain,

                balance_raw:
                  rawBalance,

                balance_formatted:
                  Number(
                    formattedBalance.toFixed(
                      8
                    )
                  ),

                /**
                 * Market price
                 */
                price,

                usd_price:
                  price,

                /**
                 * Portfolio value
                 */
                usdValue:
                  Number(
                    usdValue.toFixed(
                      2
                    )
                  ),

                /**
                 * Market data
                 */
                liquidityUsd:
                  market.liquidityUsd,

                volume24h:
                  market.volume24h,

                fdv:
                  market.fdv,

                marketCap:
                  market.marketCap,

                dex:
                  market.dex,

                pair:
                  market.pair,

                /**
                 * Price metadata
                 */
                priceConfidence:
                  market.confidence,

                priceChain:
                  market.priceChain,

                priceSource:
                  market.source,
              };
            } catch (error) {
              console.error(
                "Token processing error:",
                token.symbol,
                error.message
              );

              return {
                ...token,

                chain,

                balance_raw:
                  token.balance ?? "0",

                balance_formatted:
                  0,

                price: 0,

                usd_price: 0,

                usdValue: 0,

                liquidityUsd: 0,

                volume24h: 0,

                fdv: 0,

                marketCap: 0,

                dex: null,

                pair: null,

                priceConfidence:
                  "none",

                priceChain:
                  chain,

                priceSource:
                  "dexscreener",
              };
            }
          }
        )
      );

    const pricedTokens =
      results.filter(
        (token) =>
          token.price > 0
      );

    console.log(
      `✅ ${pricedTokens.length}/${results.length} token fiyatı bulundu`
    );

    console.log(
      `🌐 Fiyat ağı: ${chain}`
    );

    return results;
  } catch (error) {
    console.error(
      "Moralis Error"
    );

    console.error(
      error.response?.data ||
        error.message
    );

    throw new Error(
      JSON.stringify(
        error.response?.data ||
          error.message
      )
    );
  }
}

