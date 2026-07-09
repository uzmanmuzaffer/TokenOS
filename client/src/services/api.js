const BASE_URL = "https://tokenos-api.onrender.com";


export async function getTokens() {

  try {

    const response =
      await fetch(
        `${BASE_URL}/api/tokens`
      );


    const data =
      await response.json();


    return data.tokens || [];


  } catch(error) {


    console.error(
      "Token API Error:",
      error
    );


    return [];

  }

}