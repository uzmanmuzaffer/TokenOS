
import axios from "axios";

const SEARCH_TERMS = [
  "bitcoin",
  "ethereum",
  "solana",
  "bnb",
  "xrp",
  "pepe",
  "dogecoin",
  "chainlink",
  "aerodrome",
  "base",
  "meme",
  "degen",
  "virtual",
  "higher",
  "brett"
];

const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/search";

const MIN_VOLUME = 50000;
const MIN_LIQUIDITY = 50000;
const MAX_TOKENS = 10;

/*
 * Sentetik hisse / tokenları Market listesinden çıkar.
 */
const BLOCKED_SYMBOLS = new Set([
  "NVDAc",
  "AAPLc",
  "GOOGLc",
  "METAc",
  "AMZNc",
  "TSLAc",
  "MSFTc",
  "COINc",
  "MSTRc",
  "NFLXc",
  "SPYc",
  "QQQc",
  "SOL"
]);

const BLOCKED_NAME_PATTERNS = [
  "NVIDIA Corporation",
  "Apple Inc.",
  "Alphabet Inc.",
  "Meta Platforms Inc.",
  "Amazon.com",
  "Microsoft Corporation",
  "Tesla Inc.",
  "Coinbase",
  "MicroStrategy"
];

export async function getMarketTokens() {
  try {
    console.log("📡 Base crypto market verileri alınıyor...");

    let allPairs = [];

    /*
     * DexScreener aramaları
     */
    for (const term of SEARCH_TERMS) {
      try {
        const { data } = await axios.get(
          DEXSCREENER_URL,
          {
            params: {
              q: term
            },
            timeout: 10000
          }
        );

        if (Array.isArray(data?.pairs)) {
          allPairs.push(...data.pairs);
        }
      } catch (err) {
        console.log(
          `⚠️ DexScreener search error: ${term}`
        );
      }
    }

    /*
     * Sadece Base pair'leri
     */
    const basePairs = allPairs.filter(
      (pair) =>
        pair?.chainId === "base"
    );

    /*
     * Hacme göre sırala
     */
    const sortedPairs = basePairs.sort(
      (a, b) =>
        Number(b.volume?.h24 || 0) -
        Number(a.volume?.h24 || 0)
    );

    const tokens = [];
    const usedAddresses = new Set();

    for (const pair of sortedPairs) {
      const token = pair?.baseToken;

      if (
        !token?.address ||
        !token?.symbol
      ) {
        continue;
      }

      const symbol =
        String(token.symbol).trim();

      const name =
        String(
          token.name || symbol
        ).trim();

      /*
       * Blocklist kontrolü
       */
      if (
        BLOCKED_SYMBOLS.has(symbol)
      ) {
        continue;
      }

      /*
       * İsim üzerinden sentetik varlık kontrolü
       */
      const isBlockedName =
        BLOCKED_NAME_PATTERNS.some(
          (pattern) =>
            name
              .toLowerCase()
              .includes(
                pattern.toLowerCase()
              )
        );

      if (isBlockedName) {
        continue;
      }

      const volume =
        Number(
          pair.volume?.h24 || 0
        );

      const liquidity =
        Number(
          pair.liquidity?.usd || 0
        );

      const priceUsd =
        Number(
          pair.priceUsd || 0
        );

      const change24h =
        Number(
          pair.priceChange?.h24 || 0
        );

      /*
       * Minimum piyasa kalitesi
       */
      if (
        volume < MIN_VOLUME ||
        liquidity < MIN_LIQUIDITY
      ) {
        continue;
      }

      /*
       * Aynı token farklı pair'lerde
       * tekrar etmesin.
       */
      const address =
        token.address.toLowerCase();

      if (
        usedAddresses.has(address)
      ) {
        continue;
      }

      usedAddresses.add(address);

      tokens.push({
        name,

        symbol,

        address:
          token.address,

        price:
          `$${priceUsd.toFixed(6)}`,

        change:
          `${change24h.toFixed(2)}%`,

        volume,

        liquidity,

        chain: "base",

        dex:
          pair.dexId ||
          "unknown",

        pairAddress:
          pair.pairAddress ||
          null,

        url:
          pair.url ||
          null
      });

      if (
        tokens.length >= MAX_TOKENS
      ) {
        break;
      }
    }

    console.log(
      `✅ Base Crypto Market: ${tokens.length} token bulundu`
    );

    return tokens;

  } catch (error) {
    console.error(
      "❌ Market Error:",
      error.message
    );

    return [];
  }
}

