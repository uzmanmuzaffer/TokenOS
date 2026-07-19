// server/controllers/analyzeController.js

import { analyzeWallet as analyzeWalletEngine } from "../engine/walletEngine.js";
import { buildPortfolio } from "../engine/portfolioEngine.js";
import { analyzeSecurity } from "../engine/securityEngine.js";
import { calculateHealthScore } from "../engine/scoreEngine.js";
import { analyzePortfolioWithAI } from "../engine/aiEngine.js";
import { buildWalletReport } from "../engine/reportEngine.js";

export async function analyzeWallet(req, res) {
  try {
    const { wallet } = req.body || {};

    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    // 1. Multi-chain analiz
    const results = await analyzeWalletEngine(wallet);

    // 2. Portfolio özeti
    const portfolioData = buildPortfolio(results);

    // 3. Güvenlik analizi
    const security = analyzeSecurity(portfolioData.portfolio);

    // 4. Sağlık puanı
    const score = calculateHealthScore(security);

    // 5. AI analizi
    const ai = await analyzePortfolioWithAI({
      wallet,
      portfolio: portfolioData.portfolio,
      security,
      score,
    });

    // 6. Nihai rapor
    const report = buildWalletReport({
      wallet,
      chains: results.length,
      portfolio: portfolioData.portfolio,
      security,
      score,
      ai,
    });

    return res.json(report);

  } catch (error) {
    console.error("Analyze Controller Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}