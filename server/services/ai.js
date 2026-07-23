import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIReport(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are TokenOS AI, a professional blockchain security analyst. Respond with clear, practical, and structured wallet analysis in Markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error("Failed to generate AI report.");
  }
}

/**
 * Premium AI Wallet Report
 */
export async function buildPremiumReport(wallet) {
  const prompt = `
You are TokenOS AI.

Generate a professional premium wallet analysis.

Wallet Address:
${wallet}

Include the following sections:

1. Wallet Summary
2. Risk Score (0-100)
3. Portfolio Analysis
4. Diversification Analysis
5. Whale Activity
6. Smart Money Signals
7. Strengths
8. Weaknesses
9. Investment Recommendations

Return the report in Markdown format.
`;

  return await generateAIReport(prompt);
}