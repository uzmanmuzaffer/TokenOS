
import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

// ========================================
// GROQ CONFIG
// ========================================

const apiKey = process.env.GROQ_API_KEY;

let groq = null;

if (!apiKey) {
  console.warn(
    "⚠️ GROQ_API_KEY bulunamadı. AI servisi başlatılamadı."
  );

  console.log(
    "🟡 Groq AI disabled - GROQ_API_KEY missing"
  );
} else {
  try {
    groq = new Groq({
      apiKey,
    });

    console.log("🟢 Groq AI initialized");
  } catch (error) {
    console.error(
      "❌ Groq initialization failed:",
      error?.message || error
    );

    groq = null;
  }
}

// ========================================
// GENERATE AI REPORT
// ========================================

export async function generateAIReport(prompt) {
  if (!groq) {
    throw new Error(
      "Groq AI service is unavailable. Check GROQ_API_KEY."
    );
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error(
      "AI prompt is required."
    );
  }

  try {
    console.log(
      "🤖 TokenOS AI report generation started..."
    );

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",

            content:
              "You are TokenOS AI, a professional blockchain security and portfolio analyst. Analyze wallet data carefully. Respond with clear, practical and structured Markdown. Never claim to know blockchain data that was not provided.",
          },

          {
            role: "user",

            content: prompt,
          },
        ],

        temperature: 0.3,

        max_tokens: 1500,
      });

    const report =
      completion?.choices?.[0]?.message?.content;

    if (!report) {
      throw new Error(
        "Groq returned an empty AI report."
      );
    }

    console.log(
      "✅ TokenOS AI report generated successfully."
    );

    return report;
  } catch (error) {
    console.error(
      "========== GROQ ERROR =========="
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Status:",
      error?.status
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Type:",
      error?.type
    );

    if (error?.response?.data) {
      console.error(
        "Response:",
        error.response.data
      );
    }

    console.error(
      "================================"
    );

    throw new Error(
      error?.message ||
      "Failed to generate AI report."
    );
  }
}

// ========================================
// PREMIUM AI WALLET REPORT
// ========================================

export async function buildPremiumReport(wallet) {
  if (!wallet) {
    throw new Error(
      "Wallet address is required."
    );
  }

  const prompt = `
You are TokenOS AI.

Generate a professional premium wallet analysis.

Wallet Address:
${wallet}

Important:
- Do not invent blockchain balances or transactions.
- If actual wallet data is unavailable, clearly state that the analysis is based only on the supplied wallet address.
- Do not present assumptions as confirmed facts.
- Keep the report practical and easy to understand.

Include the following sections:

# TokenOS Premium Wallet Report

## 1. Wallet Summary

Explain the wallet address and what can reasonably be inferred.

## 2. Risk Score

Give a 0-100 risk score only if sufficient information is available.

Explain the reasoning.

## 3. Portfolio Analysis

Discuss portfolio composition only when actual portfolio data is available.

## 4. Diversification Analysis

Evaluate diversification based on available data.

## 5. Whale Activity

Discuss whale-related signals only when supported by available information.

## 6. Smart Money Signals

Identify potential smart-money signals only when supported by available information.

## 7. Strengths

List the wallet's potential strengths.

## 8. Weaknesses

List potential weaknesses or risks.

## 9. Investment Recommendations

Provide general educational observations.

Do not guarantee profits.

End with a short TokenOS disclaimer.
`;

  return await generateAIReport(
    prompt
  );
}

