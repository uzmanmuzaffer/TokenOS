import axios from "axios";

export async function getTokenPrice(address) {

  if (!address) {
    return null;
  }

  try {

    const { data } = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );

    if (!data?.pairs?.length) {
      return null;
    }

    // En yüksek likiditeli pair
    const pair = data.pairs.sort(
      (a, b) =>
        Number(b.liquidity?.usd || 0) -
        Number(a.liquidity?.usd || 0)
    )[0];

    return {

      price: Number(pair.priceUsd || 0),

      liquidityUsd: Number(
        pair.liquidity?.usd || 0
      ),

      volume24h: Number(
        pair.volume?.h24 || 0
      ),

      fdv: Number(
        pair.fdv || 0
      ),

      dex:
        pair.dexId || "-",

      pair:
        pair.pairAddress || "-",

      chain:
        pair.chainId || "-",

    };

  }

  catch (error) {

    console.error(
      "Dex Error:",
      error.message
    );

    return null;

  }

}