const PAIR_ADDRESS =
  "0xe178efb0155a80408f395d1c0df4c980c58e5d34";

const CHAIN = "base";

export async function getTokenMarket() {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${CHAIN}/${PAIR_ADDRESS}`
    );

    if (!response.ok) {
      throw new Error("DexScreener API Error");
    }

    const data = await response.json();

    if (!data.pair) {
      return null;
    }

    const pair = data.pair;

    return {
      priceUsd: Number(pair.priceUsd || 0),

      liquidity: Number(pair.liquidity?.usd || 0),

      marketCap: Number(pair.marketCap || pair.fdv || 0),

      fdv: Number(pair.fdv || 0),

      volume24h: Number(pair.volume?.h24 || 0),

      buys24h: Number(pair.txns?.h24?.buys || 0),

      sells24h: Number(pair.txns?.h24?.sells || 0),

      priceChange24h: Number(pair.priceChange?.h24 || 0),

      pairAddress: pair.pairAddress,

      dex: pair.dexId,

      url: pair.url,
    };
  } catch (err) {
    console.error("DexScreener:", err);
    return null;
  }
}