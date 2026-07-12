export function calculateRiskScore(tokens = []) {
  let score = 100;
  const reasons = [];

  if (tokens.length === 0) {
    return {
      score: 0,
      level: "HIGH",
      reasons: ["Wallet has no tokens"],
    };
  }

  // Diversification
  if (tokens.length < 3) {
    score -= 20;
    reasons.push("Low diversification");
  } else {
    reasons.push("Good diversification");
  }

  // Spam token check
  if (tokens.length > 100) {
    score -= 15;
    reasons.push("Large number of tokens detected");
  }

  // Zero value tokens
  const worthless = tokens.filter(
    (t) => !t.usd_value || Number(t.usd_value) === 0
  );

  if (worthless.length > tokens.length / 2) {
    score -= 20;
    reasons.push("Many zero-value tokens");
  }

  // Portfolio concentration
  const sorted = [...tokens].sort(
    (a, b) => Number(b.usd_value || 0) - Number(a.usd_value || 0)
  );

  const total = sorted.reduce(
    (sum, t) => sum + Number(t.usd_value || 0),
    0
  );

  if (total > 0) {
    const biggest = Number(sorted[0].usd_value || 0);

    if (biggest / total > 0.8) {
      score -= 25;
      reasons.push("Portfolio concentrated in one asset");
    }
  }

  score = Math.max(0, Math.min(score, 100));

  let level = "LOW";

  if (score < 40) level = "HIGH";
  else if (score < 70) level = "MEDIUM";

  return {
    score,
    level,
    reasons,
  };
}