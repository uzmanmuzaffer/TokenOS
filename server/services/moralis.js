import axios from "axios";
import { getTokenPrice } from "./tokenPrice.js";

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
    console.log("Chain :", chain);
    console.log("================================");

    const { data } = await axios.get(
      `${BASE_URL}/${wallet}/erc20`,
      {
        params: { chain },
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },
      }
    );

    const tokens = await Promise.all(
      data.slice(0, 50).map(async (token) => {
        try {
          const decimals = Number(token.decimals ?? 18);

          const rawBalance = token.balance ?? "0";

          const formattedBalance =
            Number(rawBalance) / Math.pow(10, decimals);

          let usdPrice = 0;

          if (token.token_address) {
            usdPrice = await getTokenPrice(
              token.token_address,
              chain
            );
          }

          if (!Number.isFinite(usdPrice)) {
            usdPrice = 0;
          }

          const usdValue =
            Number.isFinite(formattedBalance)
              ? formattedBalance * usdPrice
              : 0;

          return {
            ...token,

            chain,

            balance_raw: rawBalance,

            balance_formatted: Number(
              formattedBalance.toFixed(8)
            ),

            price: usdPrice,
            usd_price: usdPrice,

            usdValue: Number(
              usdValue.toFixed(2)
            ),

            liquidityUsd: null,
            volume24h: null,
            fdv: null,
            dex: null,
            pair: null,
          };
        } catch (err) {
          console.error(
            "Token processing error:",
            token.symbol,
            err.message
          );

          return {
            ...token,
            chain,
            balance_formatted: 0,
            balance_raw: "0",
            price: 0,
            usd_price: 0,
            usdValue: 0,
            liquidityUsd: null,
            volume24h: null,
            fdv: null,
            dex: null,
            pair: null,
          };
        }
      })
    );

    console.log(
      `✅ ${tokens.length} token fiyat analizi tamamlandı`
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