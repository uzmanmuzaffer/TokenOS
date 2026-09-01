import { buildPortfolioSummary } from "../utils/portfolioUtils.js";

export async function buildPortfolio(results = []) {
  const portfolio =
    await buildPortfolioSummary(results);

  return {
    success: true,

    generatedAt:
      new Date().toISOString(),

    portfolio,
  };
}