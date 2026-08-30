
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
  "base"
];

const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/search";

const MIN_VOLUME = 50000;
const MIN_LIQUIDITY = 50000;
const MAX_TOKENS = 10;

export async function getMarketTokens() {
  try {
    console.log("📡 Base market verileri alınıyor...");

    let allPairs = [];

    for (const term of SEARCH_TERMS) {
      try {
        const { data } = await axios.get(DEXSCREENER_URL, {
          params: {
            q: term
          },
          timeout: 10000
        });

        if (Array.isArray(data?.pairs)) {
          allPairs.push(...data.pairs);
        }
      } catch (err) {
        console.log(`⚠️ Search error: ${term}`);
      }
    }

    /*
     * Sadece Base ağı
     */
    const basePairs = allPairs.filter(
      (pair) => pair?.chainId === "base"
    );

    /*
     * 24 saatlik hacme göre sırala
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

      if (!token?.address || !token?.symbol) {
        continue;
      }

      const volume = Number(pair.volume?.h24 || 0);
      const liquidity = Number(pair.liquidity?.usd || 0);
      const priceUsd = Number(pair.priceUsd || 0);
      const change24h = Number(pair.priceChange?.h24 || 0);

      /*
       * Düşük likidite / hacimli tokenleri ele
       */
      if (
        volume < MIN_VOLUME ||
        liquidity < MIN_LIQUIDITY
      ) {
        continue;
      }

      /*
       * Aynı token farklı DEX/pair üzerinde bulunabilir.
       * Token adresi üzerinden tekilleştiriyoruz.
       */
      if (usedAddresses.has(token.address)) {
        continue;
      }

      usedAddresses.add(token.address);

      tokens.push({
        name: token.name || token.symbol,
        symbol: token.symbol,

        address: token.address,

        price: `$${priceUsd.toFixed(6)}`,

        change: `${change24h.toFixed(2)}%`,

        volume,

        liquidity,

        chain: "base",

        dex: pair.dexId || "unknown",

        pairAddress: pair.pairAddress || null,

        url: pair.url || null
      });

      if (tokens.length >= MAX_TOKENS) {
        break;
      }
    }

    console.log(
      `✅ Base Market: ${tokens.length} token bulundu`
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

