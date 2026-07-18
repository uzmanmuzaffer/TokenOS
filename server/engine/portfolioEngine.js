import { buildPortfolioSummary } from "../utils/portfolioUtils.js";

export function buildPortfolio(results = []) {
  const portfolio = buildPortfolioSummary(results);

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    portfolio,
  };
}