
import axios from "axios";

const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/search";

const DEXSCREENER_TOKEN_URL =
  "https://api.dexscreener.com/latest/dex/tokens";

const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

// Radar için kullanılacak arama terimleri.
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
  const priceChange = Number(
    pair.priceChange?.h24 || 0
  );

  const volume = Number(
    pair.volume?.h24 || 0
  );

  const liquidity = Number(
    pair.liquidity?.usd || 0
  );

  return {
    name:
      pair.baseToken?.name ||
      "Unknown",

    symbol:
      pair.baseToken?.symbol ||
      "???",

    address:
      pair.baseToken?.address ||
      "",

    price:
      Number(pair.priceUsd || 0),

    change24h:
      priceChange,

    volume24h:
      volume,

    liquidity,

    marketCap:
      Number(
        pair.marketCap ||
        pair.fdv ||
        0
      ),

    fdv:
      Number(pair.fdv || 0),

    dex:
      pair.dexId || "-",

    pairAddress:
      pair.pairAddress || "",

    url:
      pair.url || "",

    chain:
      "base",
  };
}

/*
 * TokenOS'un kendi tokenını doğrudan
 * DexScreener token endpointinden alıyoruz.
 *
 * Böylece TOS, radarın genel hacim/likidite
 * filtresinden etkilenmiyor.
 */
async function getTOSRadarToken() {
  try {
    const { data } =
      await axios.get(
        `${DEXSCREENER_TOKEN_URL}/${TOS_CONTRACT}`,
        {
          timeout: 10000,

          headers: {
            accept:
              "application/json",
          },
        }
      );

    const pairs =
      Array.isArray(data?.pairs)
        ? data.pairs
        : [];

    const basePairs =
      pairs.filter(
        (pair) =>
          String(
            pair.chainId || ""
          ).toLowerCase() === "base" &&
          String(
            pair.baseToken?.address ||
            pair.quoteToken?.address ||
            ""
          ).toLowerCase() === TOS_CONTRACT
      );

    if (
      basePairs.length === 0
    ) {
      console.log(
        "⚠️ TOS Base pair bulunamadı"
      );

      return null;
    }

    /*
     * TOS için en yüksek likiditeli
     * Base pair'i seçiyoruz.
     */
    basePairs.sort(
      (a, b) =>
        Number(
          b.liquidity?.usd || 0
        ) -
        Number(
          a.liquidity?.usd || 0
        )
    );

    const bestPair =
      basePairs[0];

    const token =
      normalizePair(bestPair);

    /*
     * TOS'un gerçek verisi olduğunu
     * açıkça işaretliyoruz.
     */
    token.isTokenOS = true;

    return token;
  } catch (error) {
    console.error(
      "❌ TOS Radar error:",
      error?.message
    );

    return null;
  }
}

export async function getBaseRadarTokens() {
  try {
    console.log(
      "📡 Base Radar taranıyor..."
    );

    const allPairs = [];

    for (
      const term of RADAR_TERMS
    ) {
      try {
        const { data } =
          await axios.get(
            DEXSCREENER_URL,
            {
              params: {
                q: term,
              },

              timeout: 10000,
            }
          );

        const pairs =
          data?.pairs || [];

        const basePairs =
          pairs.filter(
            (pair) =>
              pair.chainId === "base"
          );

        allPairs.push(
          ...basePairs
        );
      } catch (error) {
        console.log(
          `Radar search error: ${term}`
        );
      }
    }

    /*
     * Aynı token farklı pairlerde
     * bulunabileceği için adres üzerinden
     * tekilleştiriyoruz.
     */
    const uniqueTokens =
      new Map();

    for (
      const pair of allPairs
    ) {
      const address =
        pair.baseToken
          ?.address
          ?.toLowerCase();

      if (!address) {
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

      /*
       * Genel radar filtresi.
       *
       * TOS aşağıda özel olarak
       * ekleneceği için burada
       * filtreyi değiştirmiyoruz.
       */
      if (
        volume < MIN_VOLUME ||
        liquidity < MIN_LIQUIDITY
      ) {
        continue;
      }

      const normalized =
        normalizePair(pair);

      const existing =
        uniqueTokens.get(
          address
        );

      /*
       * Aynı tokenin en yüksek
       * liquidity'li pairini kullan.
       */
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

    /*
     * ------------------------------------------------
     * TOKENOS ÖZEL EKLEME
     * ------------------------------------------------
     *
     * TOS'un likiditesi düşük olsa bile
     * gerçek DexScreener pair'i varsa
     * Base Radar'da görünür.
     */
    const tosToken =
      await getTOSRadarToken();

    if (tosToken) {
      uniqueTokens.set(
        TOS_CONTRACT,
        tosToken
      );

      console.log(
        `🟢 TOS Radar eklendi: $${tosToken.price.toFixed(6)}`
      );
    }

    const tokens =
      Array.from(
        uniqueTokens.values()
      );

    /*
     * TOS'un kesinlikle sonuçlarda
     * kalmasını sağla.
     */
    tokens.sort(
      (a, b) => {
        if (
          a.address?.toLowerCase() ===
          TOS_CONTRACT
        ) {
          return -1;
        }

        if (
          b.address?.toLowerCase() ===
          TOS_CONTRACT
        ) {
          return 1;
        }

        return (
          b.volume24h -
          a.volume24h
        );
      }
    );

    /*
     * İlk 50 token + TOS.
     */
    const result =
      tokens.slice(0, 50);

    /*
     * Eğer TOS ilk 50 dışında kaldıysa
     * tekrar ekle.
     */
    const hasTOS =
      result.some(
        (token) =>
          token.address?.toLowerCase() ===
          TOS_CONTRACT
      );

    if (
      tosToken &&
      !hasTOS
    ) {
      result.pop();
      result.push(
        tosToken
      );
    }

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

