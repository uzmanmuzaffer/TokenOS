// server/engine/aiEngine.js

import { generateAIReport } from "../services/ai.js";

export async function analyzePortfolioWithAI(data) {
  const prompt = `
Analyze this crypto wallet portfolio.

Wallet:
${JSON.stringify(data, null, 2)}

Generate a professional report including:

1. Portfolio Summary
2. Risk Analysis
3. Diversification
4. Strengths
5. Weaknesses
6. Security Recommendations
7. Investment Suggestions

Return Markdown.
`;

  const report = await generateAIReport(prompt);

  return {
    generatedAt: new Date().toISOString(),
    model: "llama-3.3-70b-versatile",
    report,
  };
}