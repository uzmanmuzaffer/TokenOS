const BASE_URL = "https://tokenos-api.onrender.com";

// Token List API
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

// Wallet Analyzer API
export async function analyzeWallet(wallet) {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet,
      }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Wallet API Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}