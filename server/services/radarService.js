import axios from "axios";

const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/search";

// Radar için kullanılacak arama terimleri.
// Mevcut market.js'e DOKUNMUYORUZ.
const RADAR_TERMS = [
  "base",
  "base meme",
  "base token",
  "base ai",
  "base defi",
];

const MIN_VOLUME = 10000;
const MIN_LIQUIDITY = 10000;

function normalizePair(pair) {
  const priceChange = Number(pair.priceChange?.h24 || 0);
  const volume = Number(pair.volume?.h24 || 0);
  const liquidity = Number(pair.liquidity?.usd || 0);

  return {
    name: pair.baseToken?.name || "Unknown",
    symbol: pair.baseToken?.symbol || "???",
    address: pair.baseToken?.address || "",

    price: Number(pair.priceUsd || 0),

    change24h: priceChange,

    volume24h: volume,

    liquidity,

    marketCap: Number(
      pair.marketCap ||
      pair.fdv ||
      0
    ),

    fdv: Number(pair.fdv || 0),

    dex: pair.dexId || "-",

    pairAddress: pair.pairAddress || "",

    url: pair.url || "",

    chain: "base",
  };
}

export async function getBaseRadarTokens() {
  try {
    console.log("📡 Base Radar taranıyor...");

    const allPairs = [];

    for (const term of RADAR_TERMS) {
      try {
        const { data } = await axios.get(
          DEXSCREENER_URL,
          {
            params: {
              q: term,
            },
            timeout: 10000,
          }
        );

        const pairs = data?.pairs || [];

        const basePairs = pairs.filter(
          (pair) =>
            pair.chainId === "base"
        );

        allPairs.push(...basePairs);
      } catch (error) {
        console.log(
          `Radar search error: ${term}`
        );
      }
    }

    // Aynı token farklı pairlerde
    // bulunabileceği için adres üzerinden
    // tekilleştiriyoruz.
    const uniqueTokens = new Map();

    for (const pair of allPairs) {
      const address =
        pair.baseToken?.address?.toLowerCase();

      if (!address) {
        continue;
      }

      const volume =
        Number(pair.volume?.h24 || 0);

      const liquidity =
        Number(pair.liquidity?.usd || 0);

      if (
        volume < MIN_VOLUME ||
        liquidity < MIN_LIQUIDITY
      ) {
        continue;
      }

      const normalized =
        normalizePair(pair);

      const existing =
        uniqueTokens.get(address);

      // Aynı tokenin en yüksek
      // liquidity'li pairini kullan.
      if (
        !existing ||
        normalized.liquidity >
          existing.liquidity
      ) {
        uniqueTokens.set(
          address,
          normalized
        );
      }
    }

    const tokens =
      Array.from(
        uniqueTokens.values()
      );

    // Öncelik 24h hacimde.
    tokens.sort(
      (a, b) =>
        b.volume24h -
        a.volume24h
    );

    const result =
      tokens.slice(0, 50);

    console.log(
      `✅ Base Radar: ${result.length} token bulundu`
    );

    return result;
  } catch (error) {
    console.error(
      "❌ Base Radar Error:",
      error.message
    );

    return [];
  }
}