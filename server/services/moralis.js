import axios from "axios";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

export async function getWalletTokens(wallet, chain = "eth") {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error("MORALIS_API_KEY not found in environment variables.");
  }

  try {
    console.log("================================");
    console.log("Moralis API Test");
    console.log("API Key First 8:", apiKey.substring(0, 8));
    console.log("Wallet:", wallet);
    console.log("Chain:", chain);
    console.log("================================");

    const { data } = await axios.get(
      `${BASE_URL}/${wallet}/erc20`,
      {
        params: {
          chain,
        },
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);

    throw new Error(
      JSON.stringify(error.response?.data || error.message)
    );
  }
}