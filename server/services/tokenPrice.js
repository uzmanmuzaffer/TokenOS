
import axios from "axios";

/**
 * TokenOS - Token Market Data
 *
 * Fiyat kaynağı:
 * DexScreener
 *
 * Amaç:
 * - Sadece doğru chain üzerindeki pair'leri kullanmak
 * - Likiditesi olmayan pair'leri elemek
 * - En güvenilir market pair'i seçmek
 * - Fiyat + likidite + hacim + FDV + market cap bilgilerini birlikte döndürmek
 */

const DEXSCREENER_BASE =
  "https://api.dexscreener.com/latest/dex/tokens";

const REQUEST_TIMEOUT = 8000;

/**
 * Sayıyı güvenli şekilde Number'a çevirir.
 */
function toNumber(value) {
  const n = Number(value);

  return Number.isFinite(n) ? n : 0;
}

/**
 * Pair'in kullanılabilir olup olmadığını kontrol eder.
 */
function isValidPair(pair, chain) {
  if (!pair) return false;

  const pairChain =
    String(pair.chainId || "").toLowerCase();

  if (pairChain !== String(chain).toLowerCase()) {
    return false;
  }

  const price = toNumber(pair.priceUsd);
  const liquidity = toNumber(pair.liquidity?.usd);

  if (price <= 0) {
    return false;
  }

  if (liquidity <= 0) {
    return false;
  }

  return true;
}

/**
 * Pair güven skoru.
 *
 * Amaç en yüksek likiditeyi körü körüne seçmek yerine
 * likidite + hacim + fiyat kalitesi birlikte değerlendirilsin.
 */
function calculatePairScore(pair) {
  const liquidity = toNumber(
    pair?.liquidity?.usd
  );

  const volume24h = toNumber(
    pair?.volume?.h24
  );

  const price = toNumber(
    pair?.priceUsd
  );

  if (
    liquidity <= 0 ||
    price <= 0
  ) {
    return 0;
  }

  const liquidityScore =
    Math.log10(liquidity + 1) * 10;

  const volumeScore =
    Math.log10(volume24h + 1) * 5;

  return (
    liquidityScore +
    volumeScore
  );
}

/**
 * Market data getirir.
 */
export async function getTokenMarketData(
  tokenAddress,
  chain = "base"
) {
  const emptyResult = {
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

  if (!tokenAddress) {
    return emptyResult;
  }

  try {
    const { data } = await axios.get(
      `${DEXSCREENER_BASE}/${tokenAddress}`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          accept: "application/json",
        },
      }
    );

    const pairs = Array.isArray(data?.pairs)
      ? data.pairs
      : [];

    if (!pairs.length) {
      return emptyResult;
    }

    /**
     * Sadece istenen chain.
     */
    const chainPairs = pairs.filter(
      (pair) =>
        String(pair.chainId || "").toLowerCase() ===
        String(chain).toLowerCase()
    );

    /**
     * Sadece gerçek fiyat + likidite sahibi pair'ler.
     */
    const validPairs = chainPairs.filter(
      (pair) =>
        isValidPair(pair, chain)
    );

    if (!validPairs.length) {
      return emptyResult;
    }

    /**
     * Pair'leri güven skoruna göre sırala.
     */
    const sortedPairs = [...validPairs].sort(
      (a, b) =>
        calculatePairScore(b) -
        calculatePairScore(a)
    );

    const bestPair = sortedPairs[0];

    const priceUsd =
      toNumber(bestPair.priceUsd);

    const liquidityUsd =
      toNumber(bestPair.liquidity?.usd);

    const volume24h =
      toNumber(bestPair.volume?.h24);

    const fdv =
      toNumber(bestPair.fdv);

    const marketCap =
      toNumber(bestPair.marketCap);

    /**
     * Confidence hesapla.
     */
    let confidence = "very-low";

    if (
      liquidityUsd >= 100000 &&
      volume24h >= 10000
    ) {
      confidence = "high";
    } else if (
      liquidityUsd >= 25000 &&
      volume24h >= 1000
    ) {
      confidence = "medium";
    } else if (
      liquidityUsd >= 5000
    ) {
      confidence = "low";
    }

    /**
     * Eğer market cap yoksa FDV fallback olarak kullanılabilir.
     * Ancak bunu gerçek market cap diye göstermiyoruz.
     */
    const finalMarketCap =
      marketCap > 0
        ? marketCap
        : 0;

    return {
      priceUsd,
      liquidityUsd,
      volume24h,
      fdv,
      marketCap: finalMarketCap,

      dex:
        bestPair.dexId ||
        bestPair.dex ||
        null,

      pair:
        bestPair.pairAddress ||
        null,

      source: "dexscreener",

      confidence,

      priceChain:
        bestPair.chainId || chain,
    };
  } catch (error) {
    console.error(
      "Token market data error:",
      tokenAddress,
      error.message
    );

    return emptyResult;
  }
}

/**
 * Eski kodlarla uyumluluk için.
 *
 * Bazı yerlerde sadece fiyat isteniyorsa
 * doğrudan USD fiyatı döndürür.
 */
export async function getTokenPrice(
  tokenAddress,
  chain = "base"
) {
  const marketData =
    await getTokenMarketData(
      tokenAddress,
      chain
    );

  return marketData.priceUsd;
}

