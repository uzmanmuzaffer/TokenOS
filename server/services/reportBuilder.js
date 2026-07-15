import { getWalletTokens } from "./moralis.js";
import { calculateRiskScore } from "../utils/riskScore.js";
import { buildWalletPrompt } from "../prompts/walletPrompt.js";
import { generateAIReport } from "./ai.js";

export async function buildPremiumReport(wallet) {
  // Wallet tokenlarını al
  const tokens = await getWalletTokens(wallet, "eth");

  // Risk hesapla
  const risk = calculateRiskScore(tokens);

  // Prompt oluştur
  const prompt = buildWalletPrompt({
    wallet,
    chain: "Ethereum",
    tokenCount: tokens.length,
    riskScore: risk.score,
    riskLevel: risk.level,
    riskReasons: risk.reasons || [],
    tokens,
  });

  // AI raporu üret
  const report = await generateAIReport(prompt);

  return {
    success: true,
    wallet,
    generatedAt: new Date().toISOString(),

    risk: {
      score: risk.score,
      level: risk.level,
      reasons: risk.reasons,
    },

    portfolio: {
      tokenCount: tokens.length,
      tokens,
    },

    aiReport: report,
  };
}