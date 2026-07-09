import { searchPairs } from "../providers/dexscreener/index.js";

const SEARCH_TERMS = [
  "bitcoin",
  "ethereum",
  "solana",
  "bnb",
  "xrp",
  "pepe",
  "dogecoin",
  "chainlink",
  "arbitrum",
  "optimism",
];

export async function getTokens() {
  const allPairs = [];

  for (const term of SEARCH_TERMS) {
    try {
      const pairs = await searchPairs(term);
      allPairs.push(...pairs);
    } catch (error) {
      console.error(`Token search failed for "${term}"`);
    }
  }

  const usedSymbols = new Set();

  return allPairs
    .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
    .filter((pair) => {
      const symbol = pair.baseToken?.symbol;

      if (!symbol || usedSymbols.has(symbol)) return false;
      if ((pair.volume?.h24 || 0) < 50000) return false;
      if ((pair.liquidity?.usd || 0) < 50000) return false;

      usedSymbols.add(symbol);
      return true;
    })
    .slice(0, 10)
    .map((pair) => ({
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      price: `$${Number(pair.priceUsd || 0).toFixed(6)}`,
      change: `${Number(pair.priceChange?.h24 || 0).toFixed(2)}%`,
      volume: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      chain: pair.chainId,
      dex: pair.dexId,
    }));
}