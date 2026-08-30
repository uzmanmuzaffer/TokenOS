const BASE_URL = "https://tokenos-api.onrender.com";

// ==========================
// Token List API
// ==========================
export async function getTokens() {
  try {
    const response = await fetch(`${BASE_URL}/api/tokens`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data.tokens || [];
  } catch (error) {
    console.error("Token API Error:", error);

    return [];
  }
}

// ==========================
// Wallet Analyzer API
// ==========================
export async function analyzeWallet(wallet) {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Wallet API Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// ==========================
// Premium AI Wallet Report API
// ==========================
export async function getAIWalletReport(wallet) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/premium/ai-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Report API Error:", error);

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
    const response = await fetch(`${BASE_URL}/api/news`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data.news || [];
  } catch (error) {
    console.error("News API Error:", error);

    return [];
  }
}

// ==========================
// Airdrop Radar API
// ==========================
export async function getAirdropOpportunities() {
  try {
    const response = await fetch(
      `${BASE_URL}/api/airdrop/`
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");

      throw new Error(
        text || `HTTP ${response.status}`
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
    const response = await fetch(
      `${BASE_URL}/api/airdrop/refresh`
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");

      throw new Error(
        text || `HTTP ${response.status}`
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
    const response = await fetch(
      `${BASE_URL}/api/airdrop/stats`
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");

      throw new Error(
        text || `HTTP ${response.status}`
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

    const response = await fetch(
      `${BASE_URL}/api/airdrop/scan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet,

          transactionCount: Number(
            walletData?.transactionCount ??
              walletData?.portfolio?.transactionCount ??
              0
          ),

          protocolCount: Number(
            walletData?.protocolCount ??
              walletData?.portfolio?.protocolCount ??
              0
          ),

          chains: Array.isArray(
            walletData?.chains
          )
            ? walletData.chains
            : [],
        }),
      }
    );

    if (!response.ok) {
      const text =
        await response.text().catch(() => "");

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