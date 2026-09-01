import axios from "axios";

const DEXSCREENER_BASE =
  "https://api.dexscreener.com/latest/dex/tokens";

const REQUEST_TIMEOUT = 10000;
const CACHE_TTL = 30 * 1000;
const cache = new Map();

const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

const TOS_TOTAL_SUPPLY = 1_000_000_000;

const CHAIN_MAP = {
  eth: "ethereum",
  ethereum: "ethereum",
  base: "base",
  polygon: "polygon",
  bsc: "bsc",
  "bnb chain": "bsc",
  binance: "bsc",
  arbitrum: "arbitrum",
  optimism: "optimism",
};

const STABLE_QUOTES = new Set([
  "USDT",
  "USDC",
  "USD",
  "DAI",
  "USDBC",
  "USDB",
  "FDUSD",
  "USD1",
]);

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeChain(chain) {
  const value = String(chain || "base").trim().toLowerCase();
  return CHAIN_MAP[value] || value;
}

function empty(chain = "base") {
  return {
    priceUsd: 0,
    liquidityUsd: 0,
    volume24h: 0,
    fdv: 0,
    marketCap: 0,
    dex: null,
    pair: null,
    pairName: null,
    url: null,
    source: "none",
    confidence: "none",
    priceChain: normalizeChain(chain),
    verified: false,
    totalSupply: TOS_TOTAL_SUPPLY,
    pricePerTos: 0,
  };
}

function getCacheKey(address, chainId) {
  return `${chainId}:${address}`;
}

function pairLiquidity(pair) {
  return num(pair?.liquidity?.usd);
}

function pairVolume(pair) {
  return num(pair?.volume?.h24);
}

function getConfidence(liquidity, volume) {
  if (liquidity >= 100000 && volume >= 10000) return "high";
  if (liquidity >= 20000 && volume >= 1000) return "medium";
  if (liquidity > 0) return "low";
  return "none";
}

function tokenIsBase(pair, address) {
  return String(pair?.baseToken?.address || "").toLowerCase() === address;
}

function tokenIsQuote(pair, address) {
  return String(pair?.quoteToken?.address || "").toLowerCase() === address;
}

function quoteSymbol(pair) {
  return String(pair?.quoteToken?.symbol || "").toUpperCase();
}

function pairScore(pair, address) {
  const liquidity = pairLiquidity(pair);
  const volume = pairVolume(pair);
  const isBase = tokenIsBase(pair, address);
  const stable = STABLE_QUOTES.has(quoteSymbol(pair));

  let score =
    Math.log10(liquidity + 1) * 25 +
    Math.log10(volume + 1) * 15;

  if (isBase) score += 40;
  if (stable && isBase) score += 30;
  if (!isBase) score -= 50;

  return score;
}

function priceFromPair(pair, address) {
  const priceUsd = num(pair?.priceUsd);
  if (priceUsd <= 0) return 0;

  if (tokenIsBase(pair, address)) {
    return priceUsd;
  }

  return 0;
}

function pickBestPair(pairs, address) {
  const usable = pairs
    .filter((pair) => tokenIsBase(pair, address))
    .filter((pair) => priceFromPair(pair, address) > 0)
    .filter((pair) => pairLiquidity(pair) > 0);

  if (usable.length === 0) return null;

  const sortedByLiq = [...usable].sort(
    (a, b) => pairLiquidity(b) - pairLiquidity(a)
  );

  const top = sortedByLiq.slice(0, 5);
  const prices = top
    .map((pair) => priceFromPair(pair, address))
    .sort((a, b) => a - b);

  const median = prices[Math.floor(prices.length / 2)];

  const consistent = usable.filter((pair) => {
    const price = priceFromPair(pair, address);
    if (!median || median <= 0) return true;
    const ratio = price / median;
    return ratio >= 0.25 && ratio <= 4;
  });

  const pool = consistent.length > 0 ? consistent : usable;

  return pool.sort((a, b) => pairScore(b, address) - pairScore(a, address))[0];
}

export async function getTokenMarketData(tokenAddress, chain = "base") {
  if (!tokenAddress) {
    return empty(chain);
  }

  const chainId = normalizeChain(chain);
  const address = String(tokenAddress).trim().toLowerCase();
  const cacheKey = getCacheKey(address, chainId);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${DEXSCREENER_BASE}/${address}`, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        accept: "application/json",
        "User-Agent": "TokenOS/2.0",
      },
    });

    const pairs = Array.isArray(response?.data?.pairs)
      ? response.data.pairs
      : [];

    const chainPairs = pairs.filter(
      (pair) => String(pair?.chainId || "").toLowerCase() === chainId
    );

    const bestPair = pickBestPair(chainPairs, address);

    if (!bestPair) {
      const result = empty(chainId);
      cache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }

    const priceUsd = priceFromPair(bestPair, address);
    const liquidityUsd = pairLiquidity(bestPair);
    const volume24h = pairVolume(bestPair);
    const fdv = num(bestPair.fdv);
    const marketCap = num(bestPair.marketCap, fdv);

    const result = {
      priceUsd,
      pricePerTos: address === TOS_CONTRACT ? priceUsd : 0,
      liquidityUsd,
      volume24h,
      fdv: address === TOS_CONTRACT && fdv <= 0 ? priceUsd * TOS_TOTAL_SUPPLY : fdv,
      marketCap:
        address === TOS_CONTRACT && marketCap <= 0
          ? priceUsd * TOS_TOTAL_SUPPLY
          : marketCap,
      dex: bestPair.dexId || null,
      pair: bestPair.pairAddress || null,
      pairName: `${bestPair?.baseToken?.symbol || "?"}/${bestPair?.quoteToken?.symbol || "?"}`,
      url: bestPair.url || null,
      source: "dexscreener",
      confidence: getConfidence(liquidityUsd, volume24h),
      priceChain: chainId,
      verified: true,
      totalSupply: TOS_TOTAL_SUPPLY,
      baseToken: bestPair?.baseToken?.address || "",
      quoteToken: bestPair?.quoteToken?.address || "",
      pairCreatedAt: bestPair.pairCreatedAt || null,
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (error) {
    console.error(
      `Market data error [${chainId}] ${address}:`,
      error?.message
    );
    return empty(chainId);
  }
}

export async function getTokenPrice(tokenAddress, chain = "base") {
  const data = await getTokenMarketData(tokenAddress, chain);
  return num(data?.priceUsd);
}

export function clearTokenPriceCache() {
  cache.clear();
}