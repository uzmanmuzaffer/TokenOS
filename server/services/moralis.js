import axios from "axios";
import { getTokenPrice } from "./prices.js";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

export async function getWalletTokens(wallet, chain = "eth") {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error("MORALIS_API_KEY not found.");
  }

  try {
    console.log("================================");
    console.log("Moralis Wallet Analyzer");
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

    const tokens = await Promise.all(
      data.map(async (token) => {
        const decimals = Number(token.decimals || 18);

        const rawBalance = token.balance || "0";

        const formattedBalance =
          Number(rawBalance) / Math.pow(10, decimals);

        const market = await getTokenPrice(
          token.token_address
        );

        const price = market?.price ?? null;

        const usdValue =
          price !== null
            ? formattedBalance * price
            : null;

        return {
          ...token,

          formattedBalance,

          price,

          usdValue,

          liquidityUsd:
            market?.liquidityUsd ?? null,

          volume24h:
            market?.volume24h ?? null,

          fdv:
            market?.fdv ?? null,

          dex:
            market?.dex ?? null,

          pair:
            market?.pair ?? null,

          chain:
            market?.chain ?? null,
        };
      })
    );

    // USD değeri yüksek olanlar üstte
    tokens.sort(
      (a, b) =>
        (b.usdValue || 0) -
        (a.usdValue || 0)
    );

    return tokens;
  } catch (error) {
    console.error("Moralis Error");
    console.error(
      error.response?.data || error.message
    );

    throw new Error(
      JSON.stringify(
        error.response?.data || error.message
      )
    );
  }
}