import axios from "axios";


export async function getTokenPrice(tokenAddress) {

  try {

    const { data } =
      await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
        {
          timeout: 10000,
        }
      );


    const pairs =
      data.pairs || [];


    if (!pairs.length) {
      return 0;
    }


    // En yüksek likiditeli çifti seç
    const bestPair =
      pairs.sort(
        (a, b) =>
          (b.liquidity?.usd || 0) -
          (a.liquidity?.usd || 0)
      )[0];


    return Number(
      bestPair.priceUsd || 0
    );


  } catch(error) {


    console.log(
      "Token price error:",
      tokenAddress
    );


    return 0;

  }

}