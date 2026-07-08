import axios from "axios";

const SEARCH_TERMS = [
  "bitcoin",
  "ethereum",
  "solana",
  "bnb",
  "xrp",
  "pepe",
  "dogecoin",
  "chainlink",
  "arbitrum",
  "optimism"
];


export async function getMarketTokens() {

  try {

    console.log("📡 Token market verileri alınıyor...");


    let allPairs = [];


    for (const term of SEARCH_TERMS) {

      try {

        const { data } = await axios.get(
          "https://api.dexscreener.com/latest/dex/search",
          {
            params: {
              q: term
            },
            timeout: 10000
          }
        );


        if (data.pairs) {

          allPairs.push(
            ...data.pairs
          );

        }


      } catch (err) {

        console.log(
          "Search error:",
          term
        );

      }

    }


    const tokens = [];

    const usedSymbols = new Set();


    const sortedPairs =
      allPairs.sort(
        (a,b)=>
          (b.volume?.h24 || 0) -
          (a.volume?.h24 || 0)
      );


    for (const pair of sortedPairs) {


      const volume =
        pair.volume?.h24 || 0;


      const liquidity =
        pair.liquidity?.usd || 0;


      const symbol =
        pair.baseToken?.symbol;


      if (
        !symbol ||
        usedSymbols.has(symbol)
      ) {
        continue;
      }


      if (
        volume < 50000 ||
        liquidity < 50000
      ) {
        continue;
      }


      usedSymbols.add(symbol);


      tokens.push({

        name:
          pair.baseToken.name,

        symbol,

        price:
          `$${Number(
            pair.priceUsd || 0
          ).toFixed(6)}`,

        change:
          `${Number(
            pair.priceChange?.h24 || 0
          ).toFixed(2)}%`,


        volume,

        liquidity,

        chain:
          pair.chainId,

        dex:
          pair.dexId

      });


      if(tokens.length >= 10)
        break;

    }


    console.log(
      `✅ ${tokens.length} token bulundu`
    );


    return tokens;


  } catch(error) {


    console.error(
      "❌ Market Error:",
      error.message
    );


    return [];

  }

}