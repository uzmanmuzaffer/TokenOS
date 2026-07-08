import axios from "axios";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets";

const COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
];

export async function getMarketTokens() {
  try {
    console.log("📡 CoinGecko'dan veriler alınıyor...");

    const { data } = await axios.get(COINGECKO_URL, {
      params: {
        vs_currency: "usd",
        ids: COINS.join(","),
        order: "market_cap_desc",
        per_page: 5,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
      timeout: 10000,
      headers: {
        Accept: "application/json",
      },
    });

    const tokens = data.map((coin) => ({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: `$${Number(coin.current_price).toLocaleString()}`,
      change: `${Number(
        coin.price_change_percentage_24h ?? 0
      ).toFixed(2)}%`,
      image: coin.image,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
    }));

    console.log(`✅ ${tokens.length} token alındı.`);

    return tokens;
  } catch (error) {
    console.error("❌ CoinGecko Error");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    return [];
  }
}