// server/engine/aiEngine.js

import { generateAIReport } from "../services/ai.js";


export async function analyzePortfolioWithAI(data) {

  const prompt = `

You are TokenOS AI, a professional crypto portfolio intelligence assistant.

Analyze this wallet:

${JSON.stringify(data, null, 2)}


Create a professional Portfolio Doctor report.

IMPORTANT:
- Do not give financial advice.
- Provide educational portfolio analysis.
- Be clear and practical.

Return Markdown with this structure:


# 🩺 TokenOS AI Portfolio Doctor


## 1. Portfolio Summary

Explain the overall wallet condition.


## 2. Risk Analysis

Explain:

- Concentration risks
- Security risks
- Exposure risks


## 3. Diversification Analysis

Explain whether the portfolio is balanced.


## 4. Strengths

List positive points.


## 5. Weaknesses

List problems detected.


## 6. Action Plan

Give practical improvement steps:

- Short term (7 days)
- Medium term (30 days)


## 7. Final Health Summary

Give a final professional conclusion.

`;

  const report = await generateAIReport(prompt);


  return {

    generatedAt:
      new Date().toISOString(),

    model:
      "llama-3.3-70b-versatile",

    type:
      "AI_PORTFOLIO_DOCTOR",

    report

  };

}