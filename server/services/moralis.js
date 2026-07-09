import axios from "axios";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

export async function getWalletTokens(wallet, chain = "eth") {
  try {
    const response = await axios.get(
      `${BASE_URL}/${wallet}/erc20`,
      {
        params: {
          chain,
        },
        headers: {
          "x-api-key": process.env.MORALIS_API_KEY,
          accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Moralis Status:",
      error.response?.status
    );

    console.error(
      "Moralis Error:",
      error.response?.data || error.message
    );

    throw new Error("Moralis request failed");
  }
}