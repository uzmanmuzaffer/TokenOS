
import axios from "axios";

const TOKEN_ADDRESS =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

const client = axios.create({
  baseURL:
    "https://api.dexscreener.com/latest/dex",

  timeout: 10000,

  headers: {
    Accept: "application/json",
    "User-Agent": "TokenOS/2.0",
  },
});

/**
 * Genel DexScreener araması
 */
export async function searchPairs(query) {
  try {
    const { data } =
      await client.get("/search", {
        params: {
          q: query,
        },
      });

    return Array.isArray(data?.pairs)
      ? data.pairs
      : [];
  } catch (error) {
    console.error(
      "[DexScreener Search]",
      error?.message
    );

    return [];
  }
}

/**
 * TokenOS pair'lerini doğrudan
 * DexScreener token endpoint'inden al.
 */
export async function getTokenOSPairs() {
  try {
    const { data } =
      await client.get(
        `/tokens/${TOKEN_ADDRESS}`
      );

    const pairs =
      Array.isArray(data?.pairs)
        ? data.pairs
        : [];

    return pairs.filter(
      (pair) =>
        String(
          pair?.chainId || ""
        ).toLowerCase() === "base"
    );
  } catch (error) {
    console.error(
      "[TokenOS Pairs]",
      error?.message
    );

    return [];
  }
}

/**
 * TokenOS pair'inin gerçekten TOS
 * tokenını içerdiğini kontrol eder.
 */
function isTokenOSPair(pair) {
  const base =
    String(
      pair?.baseToken?.address || ""
    ).toLowerCase();

  const quote =
    String(
      pair?.quoteToken?.address || ""
    ).toLowerCase();

  return (
    base === TOKEN_ADDRESS ||
    quote === TOKEN_ADDRESS
  );
}

/**
 * Pair likiditesini güvenli şekilde al.
 */
function getLiquidity(pair) {
  return Number(
    pair?.liquidity?.usd || 0
  );
}

/**
 * TokenOS için en doğru pair'i seç.
 *
 * Öncelik:
 *
 * 1. Base chain
 * 2. TOS'u gerçekten içeren pair
 * 3. En yüksek likidite
 */
export async function getTokenOSPair() {
  try {
    let pairs =
      await getTokenOSPairs();

    /*
     * Token endpoint sonuç vermezse
     * search endpoint fallback.
     */
    if (!pairs.length) {
      pairs = (
        await searchPairs(
          TOKEN_ADDRESS
        )
      ).filter(
        (pair) =>
          String(
            pair?.chainId || ""
          ).toLowerCase() ===
          "base"
      );
    }

    if (!pairs.length) {
      console.warn(
        "[TokenOS Pair] Base pair bulunamadı."
      );

      return null;
    }

    /*
     * Önce gerçekten TOS'u içeren
     * pair'leri al.
     */
    const tosPairs =
      pairs.filter(
        isTokenOSPair
      );

    if (!tosPairs.length) {
      console.warn(
        "[TokenOS Pair] TOS içeren Base pair bulunamadı."
      );

      return null;
    }

    /*
     * En yüksek likiditeli TOS pair'i seç.
     */
    tosPairs.sort(
      (a, b) =>
        getLiquidity(b) -
        getLiquidity(a)
    );

    const selectedPair =
      tosPairs[0];

    console.log(
      `[TokenOS Pair] ${
        selectedPair?.dexId || "-"
      } ${
        selectedPair?.pairAddress || "-"
      } | Price: $${Number(
        selectedPair?.priceUsd || 0
      )}`
    );

    return selectedPair;
  } catch (error) {
    console.error(
      "[TokenOS Pair]",
      error?.message
    );

    return null;
  }
}

/**
 * Dashboard Market Verisi
 *
 * priceUsd = 1 TOS'un USD fiyatıdır.
 *
 * TOTAL SUPPLY burada kullanılmaz.
 */
export async function getTokenMarket() {
  const pair =
    await getTokenOSPair();

  if (!pair) {
    return {
      priceUsd: 0,

      liquidity: 0,

      volume24h: 0,

      fdv: 0,

      marketCap: 0,

      pairName: "-",

      dex: "-",

      pairAddress: "",

      url: "",

      source: "none",

      chain: "base",

      baseToken: TOKEN_ADDRESS,

      quoteToken: "",
    };
  }

  /*
   * DexScreener'ın verdiği fiyat:
   *
   * 1 TOS = priceUsd USD
   */
  const priceUsd =
    Number(
      pair?.priceUsd || 0
    );

  const liquidity =
    Number(
      pair?.liquidity?.usd || 0
    );

  const volume24h =
    Number(
      pair?.volume?.h24 || 0
    );

  const fdv =
    Number(
      pair?.fdv || 0
    );

  const marketCap =
    Number(
      pair?.marketCap || 0
    );

  const baseSymbol =
    pair?.baseToken?.symbol ||
    "TOS";

  const quoteSymbol =
    pair?.quoteToken?.symbol ||
    "USDC";

  return {
    /*
     * GERÇEK 1 TOS FİYATI
     */
    priceUsd,

    liquidity,

    volume24h,

    fdv,

    marketCap,

    pairName:
      `${baseSymbol}/${quoteSymbol}`,

    dex:
      pair?.dexId || "-",

    pairAddress:
      pair?.pairAddress || "",

    url:
      pair?.url || "",

    source:
      "dexscreener",

    chain:
      pair?.chainId || "base",

    baseToken:
      pair?.baseToken?.address ||
      TOKEN_ADDRESS,

    quoteToken:
      pair?.quoteToken?.address ||
      "",

    /*
     * Fiyat güvenilirliği için
     * ek bilgiler.
     */
    priceVerified:
      priceUsd > 0,

    liquidityUsd:
      liquidity,

    priceSource:
      "DexScreener",
  };
}

