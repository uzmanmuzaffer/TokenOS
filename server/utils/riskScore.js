export function calculateRiskScore(tokens = []) {
  let score = 100;
  const reasons = [];

  if (!Array.isArray(tokens) || tokens.length === 0) {
    return {
      score: 0,
      level: "HIGH",
      reasons: ["Wallet has no tokens"],

      stableTokens: 0,
      unknownTokens: 0,
      worthlessTokens: 0,
      totalValue: 0,
      diversified: false,
      concentration: 0,
    };
  }

  // Stablecoin list
  const STABLES = [
    "USDT",
    "USDC",
    "DAI",
    "USDE",
    "FDUSD",
    "TUSD",
    "USDB",
    "FRAX",
  ];

  let stableTokens = 0;
  let unknownTokens = 0;
  let worthlessTokens = 0;

  // Portfolio value
  const totalValue = tokens.reduce(
    (sum, token) => sum + Number(token.usd_value || 0),
    0
  );

  // Token analysis
  for (const token of tokens) {
    const symbol = (token.symbol || "").toUpperCase();
    const value = Number(token.usd_value || 0);

    if (STABLES.includes(symbol)) {
      stableTokens++;
    }

    if (!symbol || symbol.length < 2) {
      unknownTokens++;
    }

    if (value === 0) {
      worthlessTokens++;
    }
  }

  // Diversification
  const diversified = tokens.length >= 5;

  if (!diversified) {
    score -= 20;
    reasons.push("Low diversification");
  } else {
    reasons.push("Good diversification");
  }

  // Too many spam tokens
  if (tokens.length > 100) {
    score -= 15;
    reasons.push("Large number of tokens detected");
  }

  // Zero-value tokens
  if (worthlessTokens > tokens.length / 2) {
    score -= 20;
    reasons.push("Many zero-value tokens");
  }

  // Unknown tokens
  if (unknownTokens > 10) {
    score -= 10;
    reasons.push("Large number of unknown tokens");
  }

  // Stablecoin ratio
  if (stableTokens === 0) {
    score -= 5;
    reasons.push("No stablecoin holdings");
  }

  // Portfolio concentration
  const sorted = [...tokens].sort(
    (a, b) => Number(b.usd_value || 0) - Number(a.usd_value || 0)
  );

  let concentration = 0;

  if (totalValue > 0 && sorted.length > 0) {
    concentration =
      Number(sorted[0].usd_value || 0) / totalValue;

    if (concentration > 0.8) {
      score -= 25;
      reasons.push("Portfolio concentrated in one asset");
    }
  }

  score = Math.max(0, Math.min(score, 100));

  let level = "LOW";

  if (score < 40) {
    level = "HIGH";
  } else if (score < 70) {
    level = "MEDIUM";
  }

  return {
    score,
    level,
    reasons,

    stableTokens,
    unknownTokens,
    worthlessTokens,

    totalValue: Number(totalValue.toFixed(2)),

    diversified,

    concentration: Number((concentration * 100).toFixed(2)),
  };
}