export function calculateRiskScore(tokens) {

  let score = 100;

  let unknownTokens = 0;
  let stableTokens = 0;


  const stableList = [
    "USDC",
    "USDT",
    "DAI"
  ];


  tokens.forEach((token) => {

    const symbol = token.symbol?.toUpperCase();


    if (stableList.includes(symbol)) {
      stableTokens++;
    }


    if (!token.name || !token.symbol) {
      unknownTokens++;
    }

  });


  // Çok fazla bilinmeyen token risk artırır
  score -= unknownTokens * 5;


  // Çok az çeşitlilik biraz risk ekler
  if (tokens.length < 3) {
    score -= 15;
  }


  // Çok fazla token çeşitliliği olumlu
  if (tokens.length > 10) {
    score += 5;
  }


  if (score > 100) score = 100;
  if (score < 0) score = 0;


  let level = "HIGH";

  if (score >= 80) {
    level = "LOW";
  }
  else if (score >= 50) {
    level = "MEDIUM";
  }


  return {
    score,
    level,
    stableTokens,
    unknownTokens
  };

}