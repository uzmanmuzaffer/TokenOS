
import axios from "axios";
import { getTokenMarketData } from "./tokenPrice.js";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

const MAX_TOKENS = 100;

// TokenOS resmi Base Mainnet kontratı
const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

const SUPPORTED_CHAINS = new Set([
  "eth",
  "base",
  "polygon",
  "bsc",
  "arbitrum",
  "optimism",
]);

function safeNumber(value, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
}

function normalizeAddress(value) {
  return String(value || "").toLowerCase();
}

function isTos(token) {
  return (
    normalizeAddress(token?.token_address) ===
    TOS_CONTRACT
  );
}

function isSuspicious(token) {
  return (
    token?.possible_spam === true ||
    token?.possible_spam === "true" ||
    token?.is_spam === true
  );
}

function getTokenName(token) {
  return (
    token?.name ||
    token?.symbol ||
    "Unknown Token"
  );
}

function getDecimals(token) {
  const decimals = safeNumber(
    token?.decimals,
    18
  );

  return Math.max(
    0,
    Math.min(36, decimals)
  );
}

function formatBalance(rawBalance, decimals) {
  try {
    const raw = String(rawBalance ?? "0");

    if (!/^-?\d+$/.test(raw)) {
      return safeNumber(raw, 0);
    }

    const value =
      Number(raw) / Math.pow(10, decimals);

    return Number(
      Number.isFinite(value)
        ? value.toFixed(8)
        : "0"
    );
  } catch {
    return 0;
  }
}

export async function getWalletTokens(
  wallet,
  chain = "base"
) {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MORALIS_API_KEY not found."
    );
  }

  if (!wallet) {
    throw new Error(
      "Wallet address is required."
    );
  }

  const normalizedChain = String(
    chain || "base"
  ).toLowerCase();

  if (!SUPPORTED_CHAINS.has(normalizedChain)) {
    throw new Error(
      `Unsupported Moralis chain: ${normalizedChain}`
    );
  }

  try {
    console.log(
      "================================"
    );

    console.log(
      "TokenOS Wallet Analyzer"
    );

    console.log(
      "Wallet:",
      wallet
    );

    console.log(
      "Chain:",
      normalizedChain
    );

    console.log(
      "================================"
    );

    const response = await axios.get(
      `${BASE_URL}/${wallet}/erc20`,
      {
        params: {
          chain: normalizedChain,
        },

        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },

        timeout: 20000,
      }
    );

    /*
     * Moralis v2.2 cevabı:
     *
     * {
     *   cursor: "...",
     *   page: 0,
     *   page_size: 100,
     *   result: [...]
     * }
     *
     * Eski kod response'u doğrudan
     * array olarak kabul ediyordu.
     */
    const responseData =
      response?.data;

    const rawTokens =
      Array.isArray(responseData)
        ? responseData
        : Array.isArray(
            responseData?.result
          )
        ? responseData.result
        : [];

    console.log(
      `📦 Moralis ${normalizedChain}: ${rawTokens.length} token`
    );

    /*
     * TOS'u bul.
     */
    const tosToken =
      rawTokens.find(isTos);

    /*
     * Scam / spam tokenleri çıkar.
     */
    const verifiedTokens =
      rawTokens.filter(
        (token) =>
          !isSuspicious(token)
      );

    /*
     * Gerçek bakiyesi olan tokenler.
     */
    const nonZeroTokens =
      verifiedTokens.filter(
        (token) => {
          const raw =
            token?.balance ?? "0";

          try {
            return (
              BigInt(String(raw)) > 0n
            );
          } catch {
            return (
              safeNumber(raw, 0) > 0
            );
          }
        }
      );

    /*
     * TOS'u garantiyle ekle.
     */
    const selectedTokens = [
      ...(tosToken
        ? [tosToken]
        : []),

      ...nonZeroTokens.filter(
        (token) =>
          !isTos(token)
      ),
    ].slice(0, MAX_TOKENS);

    console.log(
      `🛡️ Spam/scam çıkarıldı: ${
        rawTokens.length -
        verifiedTokens.length
      }`
    );

    console.log(
      `🟢 ${normalizedChain} portfolio tokenleri: ${selectedTokens.length}`
    );

    if (tosToken) {
      console.log(
        "🟢 TOS bulundu:",
        tosToken.token_address
      );
    }

    /*
     * Token fiyatlarını paralel al.
     */
    const results =
      await Promise.all(
        selectedTokens.map(
          async (token) => {
            const tokenAddress =
              normalizeAddress(
                token?.token_address
              );

            const tos =
              tokenAddress ===
              TOS_CONTRACT;

            const decimals =
              getDecimals(token);

            const rawBalance =
              token?.balance ?? "0";

            const formattedBalance =
              formatBalance(
                rawBalance,
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
              source: "none",
              confidence: "none",
              priceChain:
                normalizedChain,
            };

            /*
             * Market fiyatı başarısız olsa bile
             * wallet analizini bozma.
             */
            if (tokenAddress) {
              try {
                const marketData =
                  await getTokenMarketData(
                    tokenAddress,
                    normalizedChain
                  );

                if (marketData) {
                  market = {
                    ...market,
                    ...marketData,
                  };
                }
              } catch (priceError) {
                console.warn(
                  `⚠️ Price unavailable: ${
                    token?.symbol ||
                    tokenAddress
                  }`,
                  priceError?.message
                );
              }
            }

            const price =
              safeNumber(
                market?.priceUsd,
                0
              );

            const liquidity =
              safeNumber(
                market?.liquidityUsd,
                0
              );

            const volume24h =
              safeNumber(
                market?.volume24h,
                0
              );

            const marketCap =
              safeNumber(
                market?.marketCap,
                0
              );

            const fdv =
              safeNumber(
                market?.fdv,
                0
              );

            /*
             * Fiyat geçerli mi?
             */
            const priceIsValid =
              price > 0 &&
              market?.confidence !==
                "none";

            const usdValue =
              priceIsValid
                ? formattedBalance *
                  price
                : 0;

            return {
              ...token,

              // Identity
              chain:
                normalizedChain,

              chainId:
                normalizedChain,

              token_address:
                token?.token_address,

              name:
                getTokenName(token),

              symbol:
                token?.symbol ||
                "UNKNOWN",

              logo:
                token?.logo || null,

              // TokenOS
              isTokenOS:
                tos,

              isVerified:
                tos ||
                !isSuspicious(token),

              isSuspicious:
                false,

              // Balance
              balance_raw:
                String(rawBalance),

              balance_formatted:
                formattedBalance,

              decimals,

              // Price
              price:
                priceIsValid
                  ? price
                  : 0,

              usd_price:
                priceIsValid
                  ? price
                  : 0,

              usdValue:
                priceIsValid
                  ? Number(
                      usdValue.toFixed(2)
                    )
                  : 0,

              // Market
              liquidityUsd:
                liquidity,

              volume24h,

              fdv,

              marketCap,

              dex:
                market?.dex ||
                null,

              pair:
                market?.pair ||
                null,

              // Price metadata
              priceConfidence:
                priceIsValid
                  ? market.confidence
                  : "none",

              priceChain:
                market?.priceChain ||
                normalizedChain,

              priceSource:
                priceIsValid
                  ? market.source
                  : "none",

              valuationStatus:
                priceIsValid
                  ? "priced"
                  : "unpriced",
            };
          }
        )
      );

    const pricedTokens =
      results.filter(
        (token) =>
          token.valuationStatus ===
          "priced"
      );

    const unpricedTokens =
      results.filter(
        (token) =>
          token.valuationStatus ===
          "unpriced"
      );

    console.log(
      `💰 ${normalizedChain} fiyatlanan: ${pricedTokens.length}/${results.length}`
    );

    console.log(
      `⚪ ${normalizedChain} fiyatlanmayan: ${unpricedTokens.length}/${results.length}`
    );

    return results;
  } catch (error) {
    console.error(
      `❌ Moralis ${normalizedChain} Error:`,
      error?.response?.data ||
        error?.message
    );

    throw new Error(
      error?.response?.data
        ? JSON.stringify(
            error.response.data
          )
        : error?.message ||
            "Moralis wallet request failed."
    );
  }
}

