
import axios from "axios";

const TOKEN_BATCH_SIZE = 30;

const client = axios.create({
  baseURL:
    "https://api.dexscreener.com/latest/dex",
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
 * Arc native USDC özellikle burada
 * dışarıda bırakılır.
 */
async function getDexScreenerPrices(
  tokens
) {
  const priceMap = new Map();
  const grouped = new Map();

  for (const token of tokens) {
    /*
     * Arc native USDC için DexScreener
     * kullanmıyoruz.
     */
    if (
      String(
        token?.chainId ||
          token?.chain ||
          ""
      ).toLowerCase() === "arc" &&
      token?.isNative === true &&
      token?.isUSDC === true
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
    Array.from(
      grouped.values()
    );

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

      if (!addresses) {
        continue;
      }

      const { data } =
        await client.get(
          `/tokens/${addresses}`
        );

      const pairs =
        Array.isArray(
          data?.pairs
        )
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

        const price =
          Number(
            pair?.priceUsd || 0
          );

        if (
          !chain ||
          !baseAddress ||
          !Number.isFinite(price) ||
          price <= 0
        ) {
          continue;
        }

        const key =
          `${chain}:${baseAddress}`;

        const liquidity =
          Number(
            pair?.liquidity?.usd || 0
          );

        const current =
          priceMap.get(key);

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
      (chain) =>
        chain?.success === true
    );

  const chains = [];
  const allRawTokens = [];

  let totalTokens = 0;

  /*
   * =====================================
   * CHAIN TOKENLARINI TOPLA
   * =====================================
   */
  for (
    const chain of successfulChains
  ) {
    const chainTokens =
      Array.isArray(
        chain?.tokens
      )
        ? chain.tokens
        : [];

    totalTokens +=
      chainTokens.length;

    chains.push({
      chain:
        chain?.chain || "Unknown",

      tokenCount:
        chainTokens.length,
    });

    for (
      const token of chainTokens
    ) {
      if (
        isSpamToken(token)
      ) {
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
   * =====================================
   * DEXSCREENER
   * =====================================
   *
   * Sadece normal tokenlar.
   *
   * Arc native USDC özel olarak
   * DexScreener'a gönderilmez.
   */
  const priceMap =
    await getDexScreenerPrices(
      allRawTokens
    );

  let totalValue = 0;

  const allTokens = [];

  /*
   * =====================================
   * TOKEN VALUATION
   * =====================================
   */
  for (
    const token of allRawTokens
  ) {
    const balance =
      Number(
        token?.balance_formatted ??
          0
      );

    if (
      !Number.isFinite(balance) ||
      balance <= 0
    ) {
      continue;
    }

    const chain =
      String(
        token?.chainId ||
          token?.chain ||
          ""
      ).toLowerCase();

    /*
     * ===================================
     * ARC NATIVE USDC
     * ===================================
     *
     * Arc native USDC'nin fiyatı:
     *
     * 1 USDC = $1
     *
     * Değer:
     *
     * balance × $1
     *
     * Provider'dan gelen usdValue
     * varsa onu kullanıyoruz.
     */
    if (
      chain === "arc" &&
      token?.isNative === true &&
      token?.isUSDC === true
    ) {
      const arcValue =
        Number(
          token?.usdValue ??
            balance
        );

      if (
        !Number.isFinite(
          arcValue
        ) ||
        arcValue <= 0
      ) {
        continue;
      }

      totalValue +=
        arcValue;

      allTokens.push({
        chain: "arc",

        symbol:
          "USDC",

        name:
          "USD Coin",

        balance:
          Number(
            balance.toFixed(6)
          ),

        price: 1,

        value:
          Number(
            arcValue.toFixed(2)
          ),

        logo:
          token?.logo || "",

        address:
          token?.token_address ||
          "",

        priceSource:
          "arc-native-usdc",

        pairAddress:
          "",

        dex:
          "Arc",
      });

      continue;
    }

    /*
     * ===================================
     * NORMAL EVM TOKEN
     * ===================================
     */

    const address =
      String(
        token?.token_address || ""
      ).toLowerCase();

    if (!address) {
      continue;
    }

    const key =
      `${chain}:${address}`;

    const dexData =
      priceMap.get(key);

    /*
     * KRİTİK:
     *
     * Artık token.price,
     * token.usd_price vb.
     * kontrolsüz fallback olarak
     * kullanılmıyor.
     *
     * Sadece DexScreener fiyatı
     * güvenilir kabul ediliyor.
     */
    const price =
      Number(
        dexData?.price || 0
      );

    /*
     * Gerçek piyasa fiyatı yoksa
     * token portföy değerine
     * dahil edilmiyor.
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
        token?.symbol ||
        "???",

      name:
        token?.name ||
        "Unknown",

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
        token?.token_address ||
        "",

      priceSource:
        "dexscreener",

      pairAddress:
        dexData?.pairAddress ||
        "",

      dex:
        dexData?.dex ||
        "-",
    });
  }

  /*
   * =====================================
   * SIRALAMA
   * =====================================
   */
  const tokens =
    allTokens
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .map(
        (token) => ({
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
        })
      );

  const largestHolding =
    tokens.length > 0
      ? tokens[0]
      : null;

  /*
   * =====================================
   * LOGS
   * =====================================
   */
  console.log(
    `💵 Portfolio Value: $${totalValue.toFixed(2)}`
  );

  console.log(
    `💎 Priced Tokens: ${tokens.length}`
  );

  console.log(
    `🏆 Largest Holding: ${
      largestHolding?.symbol ||
      "-"
    }`
  );

  /*
   * =====================================
   * RESULT
   * =====================================
   */
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

