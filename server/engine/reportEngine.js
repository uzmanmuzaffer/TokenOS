// server/engine/reportEngine.js

export function buildWalletReport({
  wallet,
  chains,
  portfolio,
  security,
  score,
  ai,
}) {
  return {
    success: true,

    generatedAt: new Date().toISOString(),

    wallet,

    analyzedChains: chains,

    portfolio,

    security,

    score,

    ai,
  };
}