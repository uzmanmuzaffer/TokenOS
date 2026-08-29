import axios from "axios";
import { getTokenMarketData } from "./tokenPrice.js";

const BASE_URL =
  "https://deep-index.moralis.io/api/v2.2";

const MAX_TRANSFERS = 500;
const MAX_PAGES = 5;

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeAddress(address) {
  return String(address || "").toLowerCase();
}

function isAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(address || ""));
}

function formatAmount(value, decimals = 18) {
  const n = safeNumber(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return n / Math.pow(10, decimals);
}

function containsSpamText(value) {
  const text = String(value || "").toLowerCase();

  const patterns = [
    "claim",
    "claimable",
    "visit",
    "reward",
    "rewards",
    "free",
    "airdrop",
    "airdrop",
    ".com",
    ".net",
    ".org",
    "http://",
    "https://",
    "verify",
    "verification",
  ];

  return patterns.some((pattern) =>
    text.includes(pattern)
  );
}

function looksLikeSpamToken(token) {
  const name = token.tokenName || "";
  const symbol = token.tokenSymbol || "";

  return (
    containsSpamText(name) ||
    containsSpamText(symbol)
  );
}

function getRiskFromClassification(classification) {
  switch (classification) {
    case "verified-airdrop":
      return "low";

    case "possible-airdrop":
      return "medium";

    case "spam-scam":
      return "high";

    case "purchased":
      return "low";

    default:
      return "unknown";
  }
}

function calculateConfidence({
  classification,
  market,
  spamSignal,
  incoming,
  outgoing,
}) {
  let score = 0;

  if (incoming) {
    score += 20;
  }

  if (!outgoing) {
    score += 15;
  }

  if (market?.priceUsd > 0) {
    score += 10;
  }

  if (market?.liquidityUsd > 10000) {
    score += 15;
  }

  if (market?.volume24h > 1000) {
    score += 10;
  }

  if (market?.confidence === "market") {
    score += 10;
  }

  if (spamSignal) {
    score -= 60;
  }

  if (classification === "purchased") {
    score = Math.max(score, 90);
  }

  if (classification === "spam-scam") {
    score = Math.min(score, 95);
  }

  if (classification === "verified-airdrop") {
    score = Math.max(score, 85);
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function classifyTransfer({
  wallet,
  transfer,
  token,
  market,
  walletIncomingTransfers,
  walletOutgoingTransfers,
}) {
  const walletAddress =
    normalizeAddress(wallet);

  const from =
    normalizeAddress(
      transfer.from_address
    );

  const to =
    normalizeAddress(
      transfer.to_address
    );

  const incoming =
    to === walletAddress;

  const outgoing =
    from === walletAddress;

  const spamSignal =
    looksLikeSpamToken(token);

  const tokenAddress =
    normalizeAddress(
      token.tokenAddress
    );

  const sameTokenIncoming =
    walletIncomingTransfers.filter(
      (x) =>
        normalizeAddress(
          x.tokenAddress
        ) === tokenAddress
    );

  const sameTokenOutgoing =
    walletOutgoingTransfers.filter(
      (x) =>
        normalizeAddress(
          x.tokenAddress
        ) === tokenAddress
    );

  /*
   * Eğer token cüzdandan dışarı da gönderilmişse,
   * bunun yalnızca airdrop olduğunu söylemek
   * daha zordur.
   */
  const hasOutgoing =
    sameTokenOutgoing.length > 0;

  /*
   * Token adı spam/claim sinyali içeriyorsa
   * gerçek airdrop olarak işaretlemiyoruz.
   */
  if (spamSignal) {
    return {
      classification: "spam-scam",
      reason:
        "Token metadata contains claim/reward/URL or other spam-like signals.",
      risk: "high",
    };
  }

  /*
   * Transfer dışarıdan gelip cüzdana giriyorsa
   * ve cüzdanın bu token için outgoing hareketi
   * yoksa olası airdrop sinyali.
   */
  if (
    incoming &&
    !hasOutgoing &&
    sameTokenIncoming.length === 1
  ) {
    return {
      classification: "possible-airdrop",
      reason:
        "Token was received from an external address without a detected outgoing transfer.",
      risk: "medium",
    };
  }

  /*
   * Cüzdanın aynı token için hem giriş hem çıkışı
   * varsa satın alma/swap veya normal kullanım
   * ihtimali daha yüksek.
   */
  if (
    incoming &&
    hasOutgoing
  ) {
    return {
      classification: "unknown",
      reason:
        "Token has both incoming and outgoing activity, so the transfer cannot be classified as a pure airdrop.",
      risk: "unknown",
    };
  }

  return {
    classification: "unknown",
    reason:
      "Transfer pattern does not provide enough evidence for an airdrop classification.",
    risk: "unknown",
  };
}

async function getTokenTransfers(
  wallet,
  chain,
  apiKey
) {
  const transfers = [];

  let cursor = null;

  for (
    let page = 0;
    page < MAX_PAGES;
    page++
  ) {
    const params = {
      chain,
      limit: 100,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const { data } =
      await axios.get(
        `${BASE_URL}/${wallet}/erc20/transfers`,
        {
          params,
          headers: {
            accept: "application/json",
            "x-api-key": apiKey,
          },
          timeout: 15000,
        }
      );

    const pageTransfers =
      Array.isArray(data?.result)
        ? data.result
        : [];

    transfers.push(
      ...pageTransfers
    );

    if (
      transfers.length >=
      MAX_TRANSFERS
    ) {
      break;
    }

    cursor = data?.cursor;

    if (!cursor) {
      break;
    }
  }

  return transfers.slice(
    0,
    MAX_TRANSFERS
  );
}

export async function detectWalletAirdrops(
  wallet,
  chain = "base"
) {
  const apiKey =
    process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MORALIS_API_KEY not found."
    );
  }

  if (!isAddress(wallet)) {
    throw new Error(
      "Invalid wallet address."
    );
  }

  console.log(
    "================================"
  );

  console.log(
    "TokenOS Airdrop Detector"
  );

  console.log(
    "Wallet:",
    wallet
  );

  console.log(
    "Chain :",
    chain
  );

  console.log(
    "================================"
  );

  const transfers =
    await getTokenTransfers(
      wallet,
      chain,
      apiKey
    );

  console.log(
    `📡 ${transfers.length} ERC20 transfer bulundu`
  );

  const normalized =
    transfers
      .filter(
        (transfer) =>
          isAddress(
            transfer.token_address
          )
      )
      .map((transfer) => {
        const decimals =
          safeNumber(
            transfer.decimals,
            18
          );

        return {
          tokenAddress:
            transfer.token_address,

          tokenName:
            transfer.token_name ||
            "Unknown Token",

          tokenSymbol:
            transfer.token_symbol ||
            "UNKNOWN",

          decimals,

          amount:
            formatAmount(
              transfer.value,
              decimals
            ),

          from:
            transfer.from_address,

          to:
            transfer.to_address,

          transactionHash:
            transfer.transaction_hash,

          blockTimestamp:
            transfer.block_timestamp,

          blockNumber:
            transfer.block_number,
        };
      });

  const walletAddress =
    normalizeAddress(wallet);

  const incomingTransfers =
    normalized.filter(
      (transfer) =>
        normalizeAddress(
          transfer.to
        ) === walletAddress
    );

  const outgoingTransfers =
    normalized.filter(
      (transfer) =>
        normalizeAddress(
          transfer.from
        ) === walletAddress
    );

  const tokenAddresses =
    [
      ...new Set(
        incomingTransfers.map(
          (transfer) =>
            normalizeAddress(
              transfer.tokenAddress
            )
        )
      ),
    ];

  console.log(
    `📦 ${tokenAddresses.length} farklı token transferi analiz edilecek`
  );

  const marketCache =
    new Map();

  async function getMarket(
    tokenAddress
  ) {
    const key =
      normalizeAddress(
        tokenAddress
      );

    if (marketCache.has(key)) {
      return marketCache.get(key);
    }

    try {
      const market =
        await getTokenMarketData(
          tokenAddress,
          chain
        );

      marketCache.set(
        key,
        market
      );

      return market;
    } catch {
      const emptyMarket = {
        priceUsd: 0,
        liquidityUsd: 0,
        volume24h: 0,
        fdv: 0,
        marketCap: 0,
        dex: null,
        pair: null,
        source: "dexscreener",
        confidence: "none",
        priceChain: chain,
      };

      marketCache.set(
        key,
        emptyMarket
      );

      return emptyMarket;
    }
  }

  const results = [];

  /*
   * Aynı token için gelen transferleri
   * gruplayarak tek bir token raporu oluşturuyoruz.
   */
  for (const tokenAddress of tokenAddresses) {
    const tokenTransfers =
      incomingTransfers.filter(
        (transfer) =>
          normalizeAddress(
            transfer.tokenAddress
          ) === tokenAddress
      );

    if (
      tokenTransfers.length === 0
    ) {
      continue;
    }

    const firstTransfer =
      tokenTransfers[0];

    const token = {
      tokenAddress:
        firstTransfer.tokenAddress,

      tokenName:
        firstTransfer.tokenName,

      tokenSymbol:
        firstTransfer.tokenSymbol,

      decimals:
        firstTransfer.decimals,
    };

    const market =
      await getMarket(
        token.tokenAddress
      );

    const latestTransfer =
      tokenTransfers[
        tokenTransfers.length - 1
      ];

    const outgoingForToken =
      outgoingTransfers.filter(
        (transfer) =>
          normalizeAddress(
            transfer.tokenAddress
          ) === tokenAddress
      );

    const classification =
      classifyTransfer({
        wallet,
        transfer:
          latestTransfer,
        token,
        market,
        walletIncomingTransfers:
          incomingTransfers,
        walletOutgoingTransfers:
          outgoingTransfers,
      });

    /*
     * Eğer herhangi bir transfer açıkça
     * spam ise tokeni spam olarak işaretle.
     */
    const hasSpamSignal =
      tokenTransfers.some(
        (transfer) =>
          containsSpamText(
            transfer.tokenName
          ) ||
          containsSpamText(
            transfer.tokenSymbol
          )
      );

    let finalClassification =
      classification.classification;

    let finalReason =
      classification.reason;

    let finalRisk =
      classification.risk;

    if (hasSpamSignal) {
      finalClassification =
        "spam-scam";

      finalReason =
        "Token name or symbol contains spam-like claim/reward/URL signals.";

      finalRisk = "high";
    }

    /*
     * Birden fazla incoming transfer varsa
     * bunu tek bir airdrop olarak değil,
     * repeated distribution olarak değerlendiriyoruz.
     */
    if (
      finalClassification ===
        "possible-airdrop" &&
      tokenTransfers.length > 1
    ) {
      finalReason =
        "Multiple external incoming transfers were detected for this token.";
    }

    const confidence =
      calculateConfidence({
        classification:
          finalClassification,
        market,
        spamSignal:
          hasSpamSignal,
        incoming: true,
        outgoing:
          outgoingForToken.length > 0,
      });

    const totalReceived =
      tokenTransfers.reduce(
        (sum, transfer) =>
          sum +
          safeNumber(
            transfer.amount
          ),
        0
      );

    const price =
      safeNumber(
        market.priceUsd
      );

    const estimatedValue =
      price > 0
        ? totalReceived * price
        : 0;

    results.push({
      tokenAddress:
        token.tokenAddress,

      tokenName:
        token.tokenName,

      tokenSymbol:
        token.tokenSymbol,

      decimals:
        token.decimals,

      receivedAmount:
        Number(
          totalReceived.toFixed(8)
        ),

      transferCount:
        tokenTransfers.length,

      firstReceivedAt:
        tokenTransfers[
          0
        ].blockTimestamp,

      latestReceivedAt:
        latestTransfer.blockTimestamp,

      sender:
        latestTransfer.from,

      transactionHash:
        latestTransfer.transactionHash,

      outgoingTransferCount:
        outgoingForToken.length,

      estimatedValueUsd:
        Number(
          estimatedValue.toFixed(2)
        ),

      priceUsd:
        price,

      liquidityUsd:
        safeNumber(
          market.liquidityUsd
        ),

      volume24h:
        safeNumber(
          market.volume24h
        ),

      fdv:
        safeNumber(
          market.fdv
        ),

      marketCap:
        safeNumber(
          market.marketCap
        ),

      dex:
        market.dex || null,

      pair:
        market.pair || null,

      priceConfidence:
        market.confidence ||
        "none",

      classification:
        finalClassification,

      risk:
        finalRisk,

      confidence,

      reason:
        finalReason,

      chain,

      source:
        "moralis+tokenos",
    });
  }

  /*
   * Confidence yüksek olanları önce göster.
   */
  results.sort(
    (a, b) =>
      b.confidence -
      a.confidence
  );

  const summary = {
    totalTransfers:
      transfers.length,

    analyzedTokens:
      results.length,

    verifiedAirdrops:
      results.filter(
        (x) =>
          x.classification ===
          "verified-airdrop"
      ).length,

    possibleAirdrops:
      results.filter(
        (x) =>
          x.classification ===
          "possible-airdrop"
      ).length,

    spamScam:
      results.filter(
        (x) =>
          x.classification ===
          "spam-scam"
      ).length,

    purchased:
      results.filter(
        (x) =>
          x.classification ===
          "purchased"
      ).length,

    unknown:
      results.filter(
        (x) =>
          x.classification ===
          "unknown"
      ).length,
  };

  console.log(
    "================================"
  );

  console.log(
    "AIRDROP SUMMARY"
  );

  console.log(
    summary
  );

  console.log(
    "================================"
  );

  return {
    wallet,
    chain,
    generatedAt:
      new Date().toISOString(),

    summary,

    airdrops:
      results.filter(
        (x) =>
          x.classification ===
            "verified-airdrop" ||
          x.classification ===
            "possible-airdrop"
      ),

    spam:
      results.filter(
        (x) =>
          x.classification ===
          "spam-scam"
      ),

    all:
      results,
  };
}