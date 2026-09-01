import axios from "axios";

const DEXSCREENER_BASE =
  "https://api.dexscreener.com/latest/dex/tokens";

const REQUEST_TIMEOUT = 10000;

const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

const TOS_TOTAL_SUPPLY =
  1_000_000_000;

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

const CACHE_TTL = 30 * 1000;

const cache = new Map();

function num(value, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

function normalizeChain(chain) {
  const value =
    String(chain || "base")
      .trim()
      .toLowerCase();

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

    priceChain:
      normalizeChain(chain),

    verified: false,

    totalSupply:
      TOS_TOTAL_SUPPLY,

    pricePerTos: 0,
  };
}

function validPair(pair, chainId) {
  if (!pair) {
    return false;
  }

  const pairChain =
    String(
      pair.chainId || ""
    ).toLowerCase();

  if (pairChain !== chainId) {
    return false;
  }

  const price =
    num(pair.priceUsd);

  const liquidity =
    num(pair.liquidity?.usd);

  const volume =
    num(pair.volume?.h24);

  if (price <= 0) {
    return false;
  }

  /*
   * Fiyatı tamamen sıfır / anlamsız
   * pair'leri ele.
   *
   * TOS için düşük likiditeyi
   * tamamen reddetmiyoruz.
   *
   * Çünkü şu anda gerçek pair'in
   * likiditesi çok düşük.
   */
  if (liquidity <= 0) {
    return false;
  }

  /*
   * Çok düşük likiditeli pair'lerde
   * hacim yoksa fiyat güveni düşük olur.
   *
   * Ancak pair yine de gerçek fiyat
   * olarak kullanılabilir.
   */
  return true;
}

function pairScore(pair) {
  const liquidity =
    num(pair.liquidity?.usd);

  const volume =
    num(pair.volume?.h24);

  const buys =
    num(pair.txns?.h24?.buys);

  const sells =
    num(pair.txns?.h24?.sells);

  const txns =
    buys + sells;

  return (
    Math.log10(liquidity + 1) * 25 +
    Math.log10(volume + 1) * 15 +
    Math.log10(txns + 1) * 5
  );
}

function getConfidence(
  liquidity,
  volume
) {
  if (
    liquidity >= 100000 &&
    volume >= 10000
  ) {
    return "high";
  }

  if (
    liquidity >= 10000 &&
    volume >= 1000
  ) {
    return "medium";
  }

  if (liquidity >= 1000) {
    return "low";
  }

  /*
   * Pair gerçek olsa bile
   * çok düşük likidite nedeniyle
   * güven seviyesi none.
   */
  return "very-low";
}

function getCacheKey(
  address,
  chainId
) {
  return `${chainId}:${address}`;
}

export async function getTokenMarketData(
  tokenAddress,
  chain = "base"
) {
  if (!tokenAddress) {
    return empty(chain);
  }

  const chainId =
    normalizeChain(chain);

  const supportedChains =
    Object.values(CHAIN_MAP);

  if (
    !supportedChains.includes(
      chainId
    )
  ) {
    console.warn(
      `⚠️ Unsupported market chain: ${chain}`
    );

    return empty(chain);
  }

  const address =
    String(tokenAddress)
      .trim()
      .toLowerCase();

  const cacheKey =
    getCacheKey(
      address,
      chainId
    );

  const cached =
    cache.get(cacheKey);

  if (
    cached &&
    Date.now() -
      cached.timestamp <
      CACHE_TTL
  ) {
    return cached.data;
  }

  try {
    console.log(
      `📊 DexScreener fiyatı alınıyor: ${address}`
    );

    const response =
      await axios.get(
        `${DEXSCREENER_BASE}/${address}`,
        {
          timeout:
            REQUEST_TIMEOUT,

          headers: {
            accept:
              "application/json",

            "User-Agent":
              "TokenOS/2.0",
          },
        }
      );

    const pairs =
      Array.isArray(
        response?.data?.pairs
      )
        ? response.data.pairs
        : [];

    /*
     * Sadece Base pair'leri.
     */
    const basePairs =
      pairs.filter(
        (pair) =>
          String(
            pair?.chainId || ""
          ).toLowerCase() ===
          chainId
      );

    /*
     * TokenOS'u gerçekten içeren
     * pair'leri seç.
     */
    const tosPairs =
      basePairs.filter(
        (pair) => {
          const base =
            String(
              pair?.baseToken
                ?.address || ""
            ).toLowerCase();

          const quote =
            String(
              pair?.quoteToken
                ?.address || ""
            ).toLowerCase();

          return (
            base === address ||
            quote === address
          );
        }
      );

    const validPairs =
      tosPairs
        .filter(
          (pair) =>
            validPair(
              pair,
              chainId
            )
        )
        .sort(
          (a, b) =>
            pairScore(b) -
            pairScore(a)
        );

    if (
      validPairs.length === 0
    ) {
      const result =
        empty(chainId);

      cache.set(
        cacheKey,
        {
          timestamp:
            Date.now(),

          data:
            result,
        }
      );

      return result;
    }

    /*
     * TokenOS için en iyi
     * gerçek pair.
     */
    const bestPair =
      validPairs[0];

    const priceUsd =
      num(
        bestPair.priceUsd
      );

    const liquidityUsd =
      num(
        bestPair.liquidity?.usd
      );

    const volume24h =
      num(
        bestPair.volume?.h24
      );

    const fdv =
      num(
        bestPair.fdv
      );

    /*
     * DexScreener marketCap
     * vermiyorsa total supply ile
     * kendimiz hesaplıyoruz.
     *
     * TOS:
     * 1,000,000,000 adet
     */
    const calculatedMarketCap =
      priceUsd *
      TOS_TOTAL_SUPPLY;

    const marketCap =
      num(
        bestPair.marketCap,
        calculatedMarketCap
      ) || calculatedMarketCap;

    /*
     * Eğer FDV yoksa yine supply
     * üzerinden hesapla.
     */
    const calculatedFdv =
      priceUsd *
      TOS_TOTAL_SUPPLY;

    const finalFdv =
      fdv > 0
        ? fdv
        : calculatedFdv;

    const confidence =
      getConfidence(
        liquidityUsd,
        volume24h
      );

    const baseSymbol =
      bestPair
        ?.baseToken
        ?.symbol ||
      "TOS";

    const quoteSymbol =
      bestPair
        ?.quoteToken
        ?.symbol ||
      "USDC";

    const result = {
      /*
       * GERÇEK 1 TOS FİYATI
       */
      priceUsd,

      pricePerTos:
        priceUsd,

      liquidityUsd,

      volume24h,

      fdv:
        finalFdv,

      marketCap,

      dex:
        bestPair.dexId ||
        null,

      pair:
        bestPair.pairAddress ||
        null,

      pairName:
        `${baseSymbol}/${quoteSymbol}`,

      url:
        bestPair.url ||
        null,

      source:
        "dexscreener",

      confidence,

      priceChain:
        chainId,

      /*
       * Pair gerçek olduğu için
       * veri mevcut.
       */
      verified:
        true,

      totalSupply:
        TOS_TOTAL_SUPPLY,

      baseToken:
        bestPair
          ?.baseToken
          ?.address ||
        "",

      quoteToken:
        bestPair
          ?.quoteToken
          ?.address ||
        "",

      pairCreatedAt:
        bestPair.pairCreatedAt ||
        null,
    };

    cache.set(
      cacheKey,
      {
        timestamp:
          Date.now(),

        data:
          result,
      }
    );

    console.log(
      `💰 TOS PRICE: $${priceUsd}`
    );

    console.log(
      `💧 TOS LIQUIDITY: $${liquidityUsd}`
    );

    console.log(
      `📈 TOS FDV: $${finalFdv}`
    );

    console.log(
      `📊 TOS MARKET CAP: $${marketCap}`
    );

    return result;
  } catch (error) {
    console.error(
      `❌ Market data error [${chainId}] ${address}:`,
      error?.message
    );

    return empty(chainId);
  }
}

export async function getTokenPrice(
  tokenAddress,
  chain = "base"
) {
  const data =
    await getTokenMarketData(
      tokenAddress,
      chain
    );

  return num(
    data?.priceUsd
  );
}

export function clearTokenPriceCache() {
  cache.clear();
}