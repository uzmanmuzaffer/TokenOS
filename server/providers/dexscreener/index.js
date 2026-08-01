import axios from "axios";

const TOKEN_ADDRESS =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

const client = axios.create({
  baseURL: "https://api.dexscreener.com/latest/dex",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "User-Agent": "TokenOS/2.0",
  },
});

/**
 * Genel arama
 */
export async function searchPairs(query) {
  try {
    const { data } = await client.get("/search", {
      params: { q: query },
    });

    return data?.pairs || [];
  } catch (error) {
    console.error("[DexScreener]", error.message);
    return [];
  }
}

/**
 * TokenOS Pair
 */
export async function getTokenOSPair() {
  try {
    const pairs = await searchPairs(TOKEN_ADDRESS);

    if (!pairs.length) return null;

    // Base ağındaki TokenOS pair'i
    const pair = pairs.find(
      (p) =>
        p.chainId === "base" &&
        p.baseToken?.address?.toLowerCase() === TOKEN_ADDRESS
    );

    return pair || pairs[0];
  } catch (error) {
    console.error("[TokenOS Pair]", error.message);
    return null;
  }
}

/**
 * Dashboard Market Verisi
 */
export async function getTokenMarket() {
  const pair = await getTokenOSPair();

  if (!pair) {
    return {
      priceUsd: 0,
      liquidity: 0,
      volume24h: 0,
      fdv: 0,
      marketCap: 0,
      pairName: "-",
      dex: "-",
    };
  }

  return {
    priceUsd: Number(pair.priceUsd || 0),

    liquidity: Number(pair.liquidity?.usd || 0),

    volume24h: Number(pair.volume?.h24 || 0),

    fdv: Number(pair.fdv || 0),

    marketCap: Number(pair.marketCap || 0),

    pairName:
      `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,

    dex: pair.dexId,

    pairAddress: pair.pairAddress,
  };
}