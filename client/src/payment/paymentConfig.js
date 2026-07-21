// src/payment/paymentConfig.js

export const paymentConfig = {
  // Backend API
  apiBaseUrl:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000",

  // Premium endpoint
  premiumEndpoint:
    "/api/premium/ai-report",

  // x402 ağı
  network:
    "eip155:84532",

  // Base Sepolia
  chainId:
    84532,

  // Para birimi
  currency:
    "USDC",

  // İstek zaman aşımı
  timeout:
    30000,
};