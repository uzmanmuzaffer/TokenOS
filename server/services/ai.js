import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

const MODEL_CANDIDATES = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.1-8b-instant",
].filter(Boolean);

let groq = null;

if (!apiKey) {
  console.warn("⚠️ GROQ_API_KEY missing");
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
  }
}

function getErrorMessage(error) {
  return (
    error?.message ||
    error?.error?.message ||
    "AI request failed."
  );
}

async function callModel(model, prompt) {
  return groq.chat.completions.create({
    model,

    messages: [
      {
        role: "system",
        content: `
You are TokenOS AI.

You are a blockchain portfolio intelligence assistant.

Rules:
- Never invent wallet balances.
- Never invent prices.
- Never invent transactions.
- Only analyze supplied data.
- Do not give guaranteed financial advice.
- Clearly distinguish facts from observations.
- Return clean Markdown.
        `.trim(),
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.2,
    max_tokens: 1800,
  });
}

export async function generateAIReport(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("AI prompt is required.");
  }

  if (!groq) {
    return {
      success: false,
      available: false,
      model: null,
      report:
        "AI service is unavailable because GROQ_API_KEY is missing.",
    };
  }

  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      console.log(
        `🤖 TokenOS AI trying model: ${model}`
      );

      const completion =
        await callModel(model, prompt);

      const report =
        completion?.choices?.[0]?.message?.content;

      if (!report) {
        throw new Error(
          "Groq returned an empty response."
        );
      }

      console.log(
        `✅ TokenOS AI success: ${model}`
      );

      return {
        success: true,
        available: true,
        model,
        report,
      };
    } catch (error) {
      lastError = error;

      console.warn(
        `⚠️ AI model failed: ${model}`,
        getErrorMessage(error)
      );
    }
  }

  console.error(
    "❌ All Groq models failed:",
    getErrorMessage(lastError)
  );

  return {
    success: false,
    available: false,
    model: null,
    report:
      "AI report could not be generated. Portfolio analysis is still available.",
    error: getErrorMessage(lastError),
  };
}

export async function buildPremiumReport(wallet) {
  if (!wallet) {
    throw new Error(
      "Wallet address is required."
    );
  }

  const prompt = `
Generate a TokenOS Premium Wallet Report.

Wallet:
${wallet}

Do not invent balances, prices, transactions,
or blockchain activity.

If actual blockchain data is unavailable,
say so clearly.

Sections:

# TokenOS Premium Wallet Report

## Wallet Summary

## Risk Analysis

## Portfolio Analysis

## Diversification

## Strengths

## Weaknesses

## Educational Action Plan

## Final Summary

Do not guarantee profits.
`;

  const result =
    await generateAIReport(prompt);

  return result;
}