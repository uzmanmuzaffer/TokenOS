const axios = require("axios");

const API_URL = "https://api.dexscreener.com/latest/dex/search";

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "User-Agent": "TokenOS/1.0",
  },
});

async function searchTokens(query) {
  try {
    const { data } = await client.get("", {
      params: {
        q: query,
      },
    });

    return data;
  } catch (error) {
    console.error("[DexScreener]", error.message);

    throw new Error("DexScreener request failed");
  }
}

module.exports = {
  searchTokens,
};