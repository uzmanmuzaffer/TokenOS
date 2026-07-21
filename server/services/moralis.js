import axios from "axios";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";


export async function getWalletTokens(
  wallet,
  chain = "eth"
) {

  const apiKey = process.env.MORALIS_API_KEY;


  if (!apiKey) {
    throw new Error(
      "MORALIS_API_KEY not found."
    );
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



    const tokens = data.map((token) => {

      const decimals =
        Number(token.decimals || 18);


      const rawBalance =
        token.balance || "0";


      const formattedBalance =
        Number(rawBalance) /
        Math.pow(10, decimals);



      return {

        ...token,

        formattedBalance,

        // Premium AI için şimdilik fiyat yok
        price: null,

        usdValue: null,

        liquidityUsd: null,

        volume24h: null,

        fdv: null,

        dex: null,

        pair: null,

        chain,

      };

    });



    return tokens;


  } catch(error) {


    console.error(
      "Moralis Error"
    );


    console.error(
      error.response?.data ||
      error.message
    );


    throw new Error(
      JSON.stringify(
        error.response?.data ||
        error.message
      )
    );

  }

}