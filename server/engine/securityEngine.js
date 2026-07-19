// server/engine/securityEngine.js

export function analyzeSecurity(portfolio = {}) {
  const totalValue = portfolio.totalValue || 0;
  const tokens = portfolio.tokens || [];

  const alerts = [];

  // Stablecoin oranı
  const stablecoins = ["USDT", "USDC", "DAI", "USDe"];

  const stableValue = tokens
    .filter((t) => stablecoins.includes(t.symbol))
    .reduce((sum, t) => sum + (t.value || 0), 0);

  const stablecoinRatio =
    totalValue > 0 ? Math.round((stableValue / totalValue) * 100) : 0;

  // En büyük varlık
  const largestHolding =
    tokens.length > 0
      ? Math.max(...tokens.map((t) => t.allocation || 0))
      : 0;

  // Dust token
  const dustTokens = tokens.filter((t) => (t.value || 0) < 1).length;

  // Şüpheli token (şimdilik örnek)
  const suspiciousTokens = 0;

  if (largestHolding > 50) {
    alerts.push("Portfolio is highly concentrated.");
  }

  if (dustTokens > 10) {
    alerts.push("Large number of dust tokens detected.");
  }

  if (stablecoinRatio < 5) {
    alerts.push("Very low stablecoin exposure.");
  }

  return {
    health: alerts.length === 0 ? "Healthy" : "Needs Attention",
    largestHolding,
    stablecoinRatio,
    dustTokens,
    suspiciousTokens,
    alerts,
  };
}