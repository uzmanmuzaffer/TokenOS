import axios from "axios";

const client = axios.create({
  baseURL: "https://api.dexscreener.com/latest/dex",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "User-Agent": "TokenOS/1.0",
  },
});

/**
 * DexScreener'da arama yapar.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchPairs(query) {
  try {
    const { data } = await client.get("/search", {
      params: { q: query },
    });

    return data?.pairs ?? [];
  } catch (error) {
    console.error("[DexScreener Provider]", error.message);
    throw error;
  }
}