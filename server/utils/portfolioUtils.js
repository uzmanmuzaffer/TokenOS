import axios from "axios";

const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/tokens";

const TOKEN_BATCH_SIZE = 30;

const client = axios.create({
  baseURL: "https://api.dexscreener.com/latest/dex",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "User-Agent": "TokenOS/2.0",
  },
});

/*
 * Bariz spam / claim tokenlarını portföye dahil etme.
 */
function isSpamToken(token) {
  if (
    token?.possible_spam === true ||
    token?.is_spam === true
  ) {
    return true;
  }

  const name =
    String(token?.name || "").toLowerCase();

  const symbol =
    String(token?.symbol || "").toLowerCase();

  const text =
    `${name} ${symbol}`;

  const spamPatterns = [
    "claim:",
    "claim ",
    "visit http",
    "http://",
    "https://",
    "reward",
    "free airdrop",
    "airdrop here",
    "giveaway",
    ".com",
    ".net",
    ".org",
    "rare address",
  ];

  return spamPatterns.some(
    (pattern) =>
      text.includes(pattern)
  );
}

/*
 * Array'i küçük gruplara böler.
 */
function chunkArray(array, size) {
  const chunks = [];

  for (
    let i = 0;
    i < array.length;
    i += size
  ) {
    chunks.push(
      array.slice(i, i + size)
    );
  }

  return chunks;
}

/*
 * DexScreener fiyatlarını toplu şekilde al.
 *
 * Aynı token farklı chainlerde bulunabileceği için
 * chain + address anahtarı kullanıyoruz.
 */
async function getDexScreenerPrices(tokens) {
  const priceMap = new Map();

  const grouped = new Map();

  for (const token of tokens) {
    const address =
      String(
        token?.token_address || ""
      ).toLowerCase();

    const chain =
      String(
        token?.chainId ||
          token?.chain ||
          ""
      ).toLowerCase();

    if (!address || !chain) {
      continue;
    }

    const key =
      `${chain}:${address}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        address,
        chain,
      });
    }
  }

  const uniqueTokens =
    Array.from(grouped.values());

  console.log(
    `💰 Portfolio fiyatları: ${uniqueTokens.length} token`
  );

  const batches =
    chunkArray(
      uniqueTokens,
      TOKEN_BATCH_SIZE
    );

  for (const batch of batches) {
    try {
      const addresses =
        batch
          .map(
            (item) =>
              item.address
          )
          .join(",");

      const { data } =
        await client.get(
          `/tokens/${addresses}`
        );

      const pairs =
        Array.isArray(data?.pairs)
          ? data.pairs
          : [];

      for (const pair of pairs) {
        const chain =
          String(
            pair?.chainId || ""
          ).toLowerCase();

        const baseAddress =
          String(
            pair?.baseToken?.address ||
              ""
          ).toLowerCase();

        const quoteAddress =
          String(
            pair?.quoteToken?.address ||
              ""
          ).toLowerCase();

        const price =
          Number(
            pair?.priceUsd || 0
          );

        if (
          !chain ||
          !price ||
          !Number.isFinite(price)
        ) {
          continue;
        }

        /*
         * Token base token ise doğrudan priceUsd kullan.
         */
        if (baseAddress) {
          const key =
            `${chain}:${baseAddress}`;

          const current =
            priceMap.get(key);

          const liquidity =
            Number(
              pair?.liquidity?.usd || 0
            );

          /*
           * Aynı token için en yüksek
           * likiditeli pair'i tercih et.
           */
          if (
            !current ||
            liquidity >
              current.liquidity
          ) {
            priceMap.set(key, {
              price,
              liquidity,
              pairAddress:
                pair?.pairAddress || "",
              dex:
                pair?.dexId || "-",
            });
          }
        }

        /*
         * Token quote tarafındaysa,
         * fiyatı tersine çevir.
         */
        if (
          quoteAddress &&
          quoteAddress !== baseAddress
        ) {
          const key =
            `${chain}:${quoteAddress}`;

          const basePrice =
            Number(
              pair?.priceUsd || 0
            );

          const quoteToken =
            pair?.quoteToken;

          /*
           * quote token fiyatını doğru
           * hesaplamak için base/quote
           * fiyat oranını kullan.
           *
           * DexScreener priceUsd base token
           * fiyatıdır. Quote token için
           * doğrudan güvenilir USD fiyatı
           * her pair'de çıkarılamayabilir.
           *
           * Bu nedenle yalnızca base token
           * fiyatını güvenilir kaynak kabul ediyoruz.
           */
        }
      }
    } catch (error) {
      console.warn(
        "⚠️ DexScreener price batch failed:",
        error?.message
      );
    }
  }

  return priceMap;
}

export async function buildPortfolioSummary(
  results = []
) {
  const successfulChains =
    results.filter(
      (chain) => chain.success
    );

  const chains = [];
  const allRawTokens = [];

  let totalTokens = 0;

  for (const chain of successfulChains) {
    const chainTokens =
      Array.isArray(chain.tokens)
        ? chain.tokens
        : [];

    totalTokens +=
      chainTokens.length;

    chains.push({
      chain: chain.chain,
      tokenCount:
        chainTokens.length,
    });

    for (const token of chainTokens) {
      if (isSpamToken(token)) {
        continue;
      }

      allRawTokens.push({
        ...token,

        chainId:
          token?.chainId ||
          chain?.chainId ||
          token?.chain ||
          chain?.chain,
      });
    }
  }

  /*
   * Gerçek USD fiyatlarını DexScreener'dan al.
   */
  const priceMap =
    await getDexScreenerPrices(
      allRawTokens
    );

  let totalValue = 0;

  const allTokens = [];

  for (const token of allRawTokens) {
    const balance =
      Number(
        token?.balance_formatted ?? 0
      );

    if (
      !Number.isFinite(balance) ||
      balance <= 0
    ) {
      continue;
    }

    const address =
      String(
        token?.token_address || ""
      ).toLowerCase();

    const chain =
      String(
        token?.chainId ||
          token?.chain ||
          ""
      ).toLowerCase();

    const key =
      `${chain}:${address}`;

    /*
     * Önce DexScreener.
     * Sonra token objesindeki mevcut
     * USD fiyat alanlarını fallback olarak kullan.
     */
    const dexData =
      priceMap.get(key);

    const existingPrice =
      Number(
        token?.usd_price ??
          token?.usdPrice ??
          token?.priceUsd ??
          token?.price ??
          0
      );

    const price =
      Number(
        dexData?.price ||
          existingPrice ||
          0
      );

    /*
     * Fiyat bulunamadıysa portföy
     * değerine dahil etme.
     */
    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      continue;
    }

    const value =
      balance * price;

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      continue;
    }

    totalValue += value;

    allTokens.push({
      chain:
        token?.chain ||
        chain,

      symbol:
        token?.symbol || "???",

      name:
        token?.name || "Unknown",

      balance:
        Number(
          balance.toFixed(8)
        ),

      price:
        Number(
          price.toFixed(8)
        ),

      value:
        Number(
          value.toFixed(2)
        ),

      logo:
        token?.logo || "",

      address:
        token?.token_address || "",

      priceSource:
        dexData
          ? "dexscreener"
          : "token-data",

      pairAddress:
        dexData?.pairAddress ||
        "",

      dex:
        dexData?.dex ||
        "-",
    });
  }

  /*
   * En yüksek değerden düşük değere sırala.
   */
  const tokens =
    allTokens
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .map((token) => ({
        ...token,

        allocation:
          totalValue > 0
            ? Number(
                (
                  (token.value /
                    totalValue) *
                  100
                ).toFixed(2)
              )
            : 0,
      }));

  const largestHolding =
    tokens.length > 0
      ? tokens[0]
      : null;

  console.log(
    `💵 Portfolio Value: $${totalValue.toFixed(2)}`
  );

  console.log(
    `💎 Priced Tokens: ${tokens.length}`
  );

  console.log(
    `🏆 Largest Holding: ${
      largestHolding?.symbol || "-"
    }`
  );

  return {
    totalChains:
      successfulChains.length,

    totalTokens,

    totalValue:
      Number(
        totalValue.toFixed(2)
      ),

    largestHolding,

    chains,

    tokens,
  };
}