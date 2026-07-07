import axios from "axios";

const BINANCE_URL =
  "https://api.binance.com/api/v3/ticker/24hr";


const COINS = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin"
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum"
  },
  {
    symbol: "SOLUSDT",
    name: "Solana"
  },
  {
    symbol: "BNBUSDT",
    name: "BNB"
  },
  {
    symbol: "XRPUSDT",
    name: "XRP"
  }
];


export async function getMarketTokens() {

  try {

    const response = await axios.get(
      BINANCE_URL,
      {
        timeout: 10000
      }
    );


    const prices = response.data;


    const tokens = COINS.map((coin) => {

      const data = prices.find(
        (item) =>
          item.symbol === coin.symbol
      );


      return {

        name: coin.name,

        symbol: coin.symbol.replace(
          "USDT",
          ""
        ),

        price:
          data
            ? `$${Number(data.lastPrice).toFixed(2)}`
            : "N/A",

        change:
          data
            ? `${Number(data.priceChangePercent).toFixed(2)}%`
            : "0%"

      };

    });


    console.log(
      "✅ Binance tokens:",
      tokens.length
    );


    return tokens;


  } catch (error) {

    console.error(
      "❌ Binance Error:",
      error.message
    );


    throw error;

  }

}