// server/engine/scoreEngine.js

export function calculateHealthScore(security) {
  let score = 100;

  if (!security) {
    return {
      score: 0,
      grade: "F",
      status: "Unknown",
    };
  }

  // Concentration Risk
  if (security.largestHolding > 70) {
    score -= 25;
  } else if (security.largestHolding > 50) {
    score -= 15;
  }

  // Dust Tokens
  if (security.dustTokens > 20) {
    score -= 15;
  } else if (security.dustTokens > 10) {
    score -= 8;
  }

  // Stablecoin Ratio
  if (security.stablecoinRatio < 5) {
    score -= 10;
  }

  // Suspicious Tokens
  score -= (security.suspiciousTokens || 0) * 10;

  // Alerts
  score -= (security.alerts?.length || 0) * 2;

  // Alt sınır
  score = Math.max(score, 0);

  let grade = "F";
  let status = "Critical";

  if (score >= 90) {
    grade = "A";
    status = "Excellent";
  } else if (score >= 80) {
    grade = "B";
    status = "Good";
  } else if (score >= 70) {
    grade = "C";
    status = "Medium";
  } else if (score >= 60) {
    grade = "D";
    status = "Risky";
  }

  return {
    score,
    grade,
    status,
  };
}