```javascript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import premiumRoutes from "./routes/premium.js";
import newsRoutes from "./routes/news.js";
import paymentRoutes from "./routes/payment.js";
import airdropRoutes from "./routes/airdropRoutes.js";

import {
  scanAirdropSources,
  scanWalletAirdropSources,
  getLastAirdropScan,
} from "./airdrop/airdropScanner.js";

import {
  analyzeWallet as analyzeWalletEngine,
} from "./engine/walletEngine.js";

import {
  buildPortfolio,
} from "./engine/portfolioEngine.js";

import {
  calculateRiskScore,
} from "./utils/riskScore.js";

import {
  getWalletTokens,
} from "./services/moralis.js";

import {
  getMarketTokens,
} from "./services/market.js";

import {
  getBaseRadarTokens,
} from "./services/radarService.js";

dotenv.config({
  path: "./.env",
});

// ========================================
// ENV CHECK
// ========================================

console.log("ENV:", {
  payTo: process.env.X402_PAY_TO,
  network: process.env.X402_NETWORK,
  facilitator: process.env.X402_FACILITATOR,
});

console.log("ENV CHECK");

console.log(
  "GROQ:",
  process.env.GROQ_API_KEY ? "OK" : "EMPTY"
);

console.log(
  "X402_PAY_TO:",
  process.env.X402_PAY_TO
);

console.log(
  "X402_NETWORK:",
  process.env.X402_NETWORK
);

console.log(
  "X402_FACILITATOR:",
  process.env.X402_FACILITATOR
);

console.log(
  "MORALIS_API_KEY:",
  process.env.MORALIS_API_KEY ? "OK" : "EMPTY"
);

// ========================================
// APP
// ========================================

const app = express();

const PORT = process.env.PORT || 5000;

// ========================================
// GLOBAL MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());

// ========================================
// ROUTES
// ========================================

app.use("/api/news", newsRoutes);

app.use("/api/payment", paymentRoutes);

// Airdrop routes
app.use("/api/airdrop", airdropRoutes);

// Premium
app.use("/api/premium", premiumRoutes);

// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "TokenOS API",
    version: "1.0.0",
    status: "running",
  });
});

// ========================================
// MARKET TOKENS
// ========================================

app.get("/api/tokens", async (req, res) => {
  try {
    const tokens = await getMarketTokens();

    res.json({
      success: true,
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    console.error("Token API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========================================
// BASE RADAR
// ========================================

app.get("/api/radar", async (req, res) => {
  try {
    const tokens = await getBaseRadarTokens();

    res.json({
      success: true,
      count: tokens.length,
      chain: "base",
      tokens,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Radar API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========================================
// LEGACY AIRDROP DISCOVERY
// ========================================
// Frontend /api/airdrops çağırıyorsa çalışır.
// Yeni route sistemi /api/airdrop altında da çalışmaya devam eder.

app.get("/api/airdrops", async (req, res) => {
  try {
    console.log("🎁 Airdrop Discovery API");

    const result = await scanAirdropSources();

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Airdrop Discovery Error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Airdrop discovery failed.",
      airdrops: [],
    });
  }
});

// ========================================
// LEGACY WALLET AIRDROP SOURCES
// ========================================
// Eski frontend çağrıları için uyumluluk.

app.get(
  "/api/airdrops/wallet/:wallet",
  async (req, res) => {
    try {
      const {
        wallet,
      } = req.params;

      const result =
        await scanWalletAirdropSources(
          wallet
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Wallet Airdrop Error:",
        error
      );

      res.status(500).json({
        success: false,
        error: error.message,
        sources: [],
      });
    }
  }
);

// ========================================
// LEGACY AIRDROP STATUS
// ========================================

app.get(
  "/api/airdrops/status",
  (req, res) => {
    res.json({
      success: true,
      lastScan:
        getLastAirdropScan(),
    });
  }
);

// ========================================
// WALLET ANALYZER V1
// ========================================

app.post(
  "/api/analyze",
  async (req, res) => {
    try {
      const {
        wallet,
      } = req.body || {};

      if (!wallet) {
        return res.status(400).json({
          success: false,
          error:
            "Wallet address is required",
        });
      }

      console.log(
        "🔍 Analyzing:",
        wallet
      );

      const tokens =
        await getWalletTokens(
          wallet,
          "eth"
        );

      const risk =
        calculateRiskScore(tokens);

      res.json({
        success: true,
        wallet,
        chain: "Ethereum",
        tokenCount: tokens.length,
        riskScore: risk.score,
        riskLevel: risk.level,
        riskDetails: {
          stableTokens:
            risk.stableTokens,
          unknownTokens:
            risk.unknownTokens,
        },
        tokens,
      });
    } catch (error) {
      console.error(
        "Analyze Error:",
        error
      );

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// ========================================
// WALLET ENGINE V2
// ========================================

app.post(
  "/api/analyze-v2",
  async (req, res) => {
    try {
      const {
        wallet,
      } = req.body || {};

      if (!wallet) {
        return res.status(400).json({
          success: false,
          error:
            "Wallet address is required",
        });
      }

      console.log(
        "🚀 Wallet Engine:",
        wallet
      );

      const results =
        await analyzeWalletEngine(
          wallet
        );

      const portfolio =
        buildPortfolio(results);

      res.json({
        success: true,
        wallet,
        analyzedChains:
          results.length,
        portfolio:
          portfolio.portfolio,
        results,
      });
    } catch (error) {
      console.error(
        "Wallet Engine Error:",
        error
      );

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// ========================================
// SERVER START
// ========================================

app.listen(PORT, () => {
  console.log("");
  console.log("====================================");
  console.log("🚀 TokenOS Backend");
  console.log("====================================");
  console.log(
    `📡 http://localhost:${PORT}`
  );
  console.log(
    `📊 Tokens: http://localhost:${PORT}/api/tokens`
  );
  console.log(
    `📡 Radar: http://localhost:${PORT}/api/radar`
  );
  console.log(
    `🎁 Airdrops: http://localhost:${PORT}/api/airdrops`
  );
  console.log(
    `🎁 Airdrop Engine: http://localhost:${PORT}/api/airdrop`
  );
  console.log("====================================");
});
```
