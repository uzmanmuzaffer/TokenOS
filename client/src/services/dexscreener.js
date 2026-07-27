const TOKEN_ADDRESS =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10";


export async function getTokenMarket() {

  try {

    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`
    );


    if (!response.ok) {
      throw new Error("DexScreener API error");
    }


    const data = await response.json();


    if (!data.pairs || data.pairs.length === 0) {

      console.log("Pair bulunamadı");

      return null;
    }



    // Base + en yüksek liquidity seç

    const pairs = data.pairs
      .filter(
        p => p.chainId === "base"
      )
      .sort(
        (a,b)=>
          (b.liquidity?.usd || 0)
          -
          (a.liquidity?.usd || 0)
      );


    const pair = pairs[0];


    if(!pair){
      return null;
    }



    return {

      priceUsd:
        Number(pair.priceUsd || 0),


      liquidity:
        Number(pair.liquidity?.usd || 0),


      marketCap:
        Number(
          pair.marketCap ||
          pair.fdv ||
          0
        ),


      volume24h:
        Number(
          pair.volume?.h24 || 0
        ),


      dex:
        pair.dexId,


      pairAddress:
        pair.pairAddress,


      url:
        pair.url

    };


  } catch(error){

    console.error(
      "DexScreener Error:",
      error
    );


    return null;

  }

}