import axios from "axios";

export async function getTokenPrice(tokenAddress, chain = "base") {
  try {
    const { data } = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        timeout: 10000,
      }
    );

    const pairs = data?.pairs ?? [];

    if (!pairs.length) {
      return 0;
    }

    // Önce istenen chain'i filtrele
    let filteredPairs = pairs.filter(
      (pair) =>
        pair.chainId?.toLowerCase() === chain.toLowerCase()
    );

    // Eğer o chain'de pair yoksa tüm pair'leri kullan
    if (!filteredPairs.length) {
      filteredPairs = pairs;
    }

    // En yüksek likiditeli pair
    const bestPair = filteredPairs.sort(
      (a, b) =>
        Number(b?.liquidity?.usd ?? 0) -
        Number(a?.liquidity?.usd ?? 0)
    )[0];

    const price = Number(bestPair?.priceUsd ?? 0);

    return Number.isFinite(price) ? price : 0;
  } catch (error) {
    console.error(
      "Token price error:",
      tokenAddress,
      error.message
    );

    return 0;
  }
}