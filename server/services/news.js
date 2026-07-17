const fallbackNews = [
  {
    title: "Bitcoin market analysis continues as institutional interest grows",
    description:
      "Latest Bitcoin market movements and crypto ecosystem updates.",
    url: "https://www.coindesk.com",
    image: null,
    source: "CoinDesk",
    published: new Date(),
  },
  {
    title: "Ethereum ecosystem developments and DeFi updates",
    description:
      "New developments across Ethereum and decentralized finance.",
    url: "https://cointelegraph.com",
    image: null,
    source: "CoinTelegraph",
    published: new Date(),
  },
];


export async function getCryptoNews() {

  try {

    const response = await fetch(
      "https://www.coindesk.com/arc/outboundfeeds/rss/"
    );


    if (!response.ok) {
      throw new Error(
        `RSS status ${response.status}`
      );
    }


    return fallbackNews;


  } catch(error) {

    console.error(
      "News Service Error:",
      error.message
    );


    return fallbackNews;

  }

}