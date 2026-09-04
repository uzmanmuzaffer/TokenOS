
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ==========================
// Token List API
// ==========================
export async function getTokens() {
  try {
    const response = await fetch(
      `${BASE_URL}/api/tokens`
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    return data.tokens || [];
  } catch (error) {
    console.error(
      "Token API Error:",
      error
    );

    return [];
  }
}

// ==========================
// TOKENOS MARKET API
// ==========================
export async function getTokenOSMarket() {
  try {
    const response = await fetch(
      `${BASE_URL}/api/tokenos`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    if (!data?.success) {
      throw new Error(
        data?.error ||
        "TokenOS market unavailable."
      );
    }

    return data;
  } catch (error) {
    console.error(
      "TokenOS Market API Error:",
      error
    );

    return {
      success: false,

      token: {
        name: "TokenOS",
        symbol: "TOS",
        address:
          "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10",
        network: "Base",
        chain: "base",
        totalSupply: 1000000000,

        price: 0,
        priceUsd: 0,

        liquidity: 0,
        liquidityUsd: 0,

        marketCap: 0,
        fdv: 0,

        volume24h: 0,

        dex: "-",
        pair: "",

        source: "none",
        confidence: "none",

        indexed: false,
      },
    };
  }
}

// ==========================
// Wallet Analyzer API
// ==========================
export async function analyzeWallet(
  wallet
) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/analyze-v2`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          wallet,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Wallet API Error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

// ==========================
// Premium AI Wallet Report API
// ==========================
export async function getAIWalletReport(
  wallet
) {
  try {
    const response =
      await fetch(
        `${BASE_URL}/api/premium/ai-report`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            wallet,
          }),
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "AI Report API Error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

// ==========================
// Crypto News API
// ==========================
export async function getNews() {
  try {
    const response = await fetch(
      `${BASE_URL}/api/news`
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    return data.news || [];
  } catch (error) {
    console.error(
      "News API Error:",
      error
    );

    return [];
  }
}

// ==========================
// Airdrop Radar API
// ==========================
export async function getAirdropOpportunities() {
  try {
    const response =
      await fetch(
        `${BASE_URL}/api/airdrop/`
      );

    if (!response.ok) {
      const text =
        await response
          .text()
          .catch(() => "");

      throw new Error(
        text ||
          `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Airdrop Radar API Error:",
      error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Airdrop Radar request failed.",

      airdrops: [],
    };
  }
}

// ==========================
// Airdrop Radar Refresh
// ==========================
export async function refreshAirdropRadar() {
  try {
    const response =
      await fetch(
        `${BASE_URL}/api/airdrop/refresh`
      );

    if (!response.ok) {
      const text =
        await response
          .text()
          .catch(() => "");

      throw new Error(
        text ||
          `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Airdrop Refresh API Error:",
      error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Airdrop refresh failed.",

      airdrops: [],
    };
  }
}

// ==========================
// Airdrop Radar Stats
// ==========================
export async function getAirdropStats() {
  try {
    const response =
      await fetch(
        `${BASE_URL}/api/airdrop/stats`
      );

    if (!response.ok) {
      const text =
        await response
          .text()
          .catch(() => "");

      throw new Error(
        text ||
          `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Airdrop Stats API Error:",
      error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Airdrop stats request failed.",
    };
  }
}

// ==========================
// Airdrop Wallet Scan API
// ==========================
export async function scanWalletAirdrops(
  wallet,
  walletData = null
) {
  try {
    if (!wallet) {
      throw new Error(
        "Wallet address is required."
      );
    }

    const response =
      await fetch(
        `${BASE_URL}/api/airdrop/scan`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            wallet,

            transactionCount:
              Number(
                walletData
                  ?.transactionCount ??
                  walletData
                    ?.portfolio
                    ?.transactionCount ??
                  0
              ),

            protocolCount:
              Number(
                walletData
                  ?.protocolCount ??
                  walletData
                    ?.portfolio
                    ?.protocolCount ??
                  0
              ),

            chains:
              Array.isArray(
                walletData?.chains
              )
                ? walletData.chains
                : [],
          }),
        }
      );

    if (!response.ok) {
      const text =
        await response
          .text()
          .catch(() => "");

      throw new Error(
        text ||
          `Airdrop API HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Airdrop Scan API Error:",
      error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Airdrop scan failed.",

      results: [],

      summary: {},
    };
  }
}
// ==========================
// Rewards API
// ==========================

// GET /api/rewards/balance/:userId
export async function getRewardBalance(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await fetch(
      `${BASE_URL}/api/rewards/balance/${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Reward Balance API Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to load reward balance.",
    };
  }
}

// POST /api/rewards/earn
export async function earnReward(
  userId,
  activity
) {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!activity) {
      throw new Error(
        "Reward activity is required."
      );
    }

    const response = await fetch(
      `${BASE_URL}/api/rewards/earn`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          userId,
          activity,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Earn Reward API Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to earn reward.",
    };
  }
}

// GET /api/rewards/config
export async function getRewardConfig() {
  try {
    const response = await fetch(
      `${BASE_URL}/api/rewards/config`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Reward Config API Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to load reward configuration.",
    };
  }
}

