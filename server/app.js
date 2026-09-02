import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import billingRoutes from "./routes/billing.js";
import { consumeQuota } from "./services/billingService.js";
import { extractAccountId } from "./middleware/quota.js";

import tosOnchainRoutes from "./routes/tosOnchainRoutes.js";

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
  analyzeSecurity,
} from "./engine/securityEngine.js";

import {
  calculateHealthScore,
} from "./engine/scoreEngine.js";

import {
  analyzePortfolioWithAI,
} from "./engine/aiEngine.js";

import {
  getWalletTokens,
} from "./services/moralis.js";

import {
  getMarketTokens,
} from "./services/market.js";

import {
  getBaseRadarTokens,
} from "./services/radarService.js";

import {
  getTokenMarketData,
} from "./services/tokenPrice.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 5000;

const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10";

const TOS_SUPPLY =
  1_000_000_000;

app.use(cors());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 90,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

/* ========================================
   ROUTES
======================================== */

app.use(
  "/api/news",
  newsRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use(
  "/api/airdrop",
  airdropRoutes
);

app.use(
  "/api/premium",
  premiumRoutes
);

app.use("/api/billing", billingRoutes);

/* ========================================
   TOKENOS ONCHAIN
======================================== */

app.use(
  "/api/tokenos",
  tosOnchainRoutes
);

/* ========================================
   HEALTH
======================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "TokenOS API",
    version: "2.0.0",
    status: "running",

    services: {
      moralis:
        Boolean(
          process.env.MORALIS_API_KEY
        ),

      groq:
        Boolean(
          process.env.GROQ_API_KEY
        ),
    },

    timestamp:
      new Date().toISOString(),
  });
});

/* ========================================
   TOKENOS MARKET
======================================== */

app.get(
  "/api/tokenos",
  async (req, res) => {
    try {
      const market =
        await getTokenMarketData(
          TOS_CONTRACT,
          "base"
        );

      res.json({
        success: true,

        token: {
          name: "TokenOS",
          symbol: "TOS",

          address:
            TOS_CONTRACT,

          network: "Base",
          chain: "base",

          totalSupply:
            TOS_SUPPLY,

          price:
            market.priceUsd,

          priceUsd:
            market.priceUsd,

          liquidity:
            market.liquidityUsd,

          liquidityUsd:
            market.liquidityUsd,

          marketCap:
            market.marketCap,

          fdv:
            market.fdv,

          volume24h:
            market.volume24h,

          dex:
            market.dex,

          pair:
            market.pair,

          source:
            market.source,

          confidence:
            market.confidence,

          indexed:
            market.priceUsd > 0,

          updatedAt:
            new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(
        "TokenOS market error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error?.message ||
          "TokenOS market unavailable.",
      });
    }
  }
);

/* ========================================
   MARKET TOKENS
======================================== */

app.get(
  "/api/tokens",
  async (req, res) => {
    try {
      const tokens =
        await getMarketTokens();

      res.json({
        success: true,
        count: tokens.length,
        tokens,

        updatedAt:
          new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Token API Error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Token market failed.",

        tokens: [],
      });
    }
  }
);

/* ========================================
   BASE RADAR
======================================== */

app.get(
  "/api/radar",
  async (req, res) => {
    try {
      console.log(
        "📡 Base Radar scanning..."
      );

      const tokens =
        await getBaseRadarTokens();

      res.json({
        success: true,
        count: tokens.length,
        chain: "base",
        tokens,

        updatedAt:
          new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Radar API Error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Radar failed.",

        tokens: [],
      });
    }
  }
);

/* ========================================
   AIRDROP
======================================== */

app.get(
  "/api/airdrops",
  async (req, res) => {
    try {
      const result =
        await scanAirdropSources();

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
          error?.message ||
          "Airdrop discovery failed.",

        airdrops: [],
      });
    }
  }
);

app.get(
  "/api/airdrops/wallet/:wallet",
  async (req, res) => {
    try {
      const result =
        await scanWalletAirdropSources(
          req.params.wallet
        );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Wallet airdrop scan failed.",

        sources: [],
      });
    }
  }
);

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

/* ========================================
   WALLET ANALYZER V1
======================================== */

app.post(
  "/api/analyze",
  async (req, res) => {
    try {
      const wallet =
        String(
          req.body?.wallet || ""
        ).trim();

      if (!wallet) {
        return res.status(400).json({
          success: false,

          error:
            "Wallet address is required.",
        });
      }

      const tokens =
        await getWalletTokens(
          wallet,
          "base"
        );

      res.json({
        success: true,

        wallet,

        chain: "Base",

        tokenCount:
          tokens.length,

        tokens,
      });
    } catch (error) {
      console.error(
        "Analyze V1 Error:",
        error
      );

      res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Wallet analysis failed.",
      });
    }
  }
);

/* ========================================
   WALLET ANALYZER V2
======================================== */

app.post(
  "/api/analyze-v2",
  async (req, res) => {
    const startedAt =
      Date.now();

    try {
      const wallet =
        String(
          req.body?.wallet || ""
        ).trim();

      if (!wallet) {
        return res.status(400).json({
          success: false,

          error:
            "Wallet address is required.",
        });
      }

      console.log("");

            const quota = await consumeQuota(
        extractAccountId(req),
        "scans"
      );

      if (!quota.ok) {
        return res.status(402).json({
          success: false,
          error: quota.message,
          code: quota.code,
          quota,
          upgradeUrl: "/pricing",
        });
      }

      console.log(
        "========================================"
      );

      console.log(
        "🚀 TOKENOS WALLET ANALYSIS"
      );

      console.log(
        "Wallet:",
        wallet
      );

      console.log(
        "========================================"
      );

      /* -------------------------------
         1. MULTI CHAIN
      ------------------------------- */

      const results =
        await analyzeWalletEngine(
          wallet
        );

      console.log(
        "⛓️ Chains analyzed:",
        results.length
      );

      /* -------------------------------
         2. PORTFOLIO
      ------------------------------- */

      const portfolioData =
        await buildPortfolio(
          results
        );

      const portfolio =
        portfolioData.portfolio;

      /* -------------------------------
         3. SECURITY
      ------------------------------- */

      let security = {
        score: 100,
        level: "LOW",
        findings: [],
      };

      try {
        security =
          analyzeSecurity(
            portfolio
          );
      } catch (error) {
        console.warn(
          "⚠️ Security analysis failed:",
          error?.message
        );
      }

      /* -------------------------------
         4. HEALTH SCORE
      ------------------------------- */

      let score = {
        score: 0,
        level: "UNKNOWN",
      };

      try {
        score =
          calculateHealthScore(
            security
          );
      } catch (error) {
        console.warn(
          "⚠️ Health score failed:",
          error?.message
        );
      }

      /* -------------------------------
         5. AI
      ------------------------------- */

      let ai = {
        generatedAt:
          new Date().toISOString(),

        model: null,

        type:
          "AI_PORTFOLIO_DOCTOR",

        available: false,

        report:
          "AI report unavailable.",
      };

      try {
        const aiResult =
          await analyzePortfolioWithAI({
            wallet,

            portfolio,

            security,

            score,
          });

        if (aiResult) {
          ai = {
            ...ai,

            ...aiResult,

            available:
              Boolean(
                aiResult?.report
              ),
          };
        }
      } catch (error) {
        console.warn(
          "⚠️ AI unavailable:",
          error?.message
        );
      }

      /* -------------------------------
         6. CHAIN SUMMARY
      ------------------------------- */

      const chainSummary =
        results.map(
          (chain) => ({
            chain:
              chain.chain,

            chainId:
              chain.chainId ||
              null,

            success:
              Boolean(
                chain.success
              ),

            tokenCount:
              Number(
                chain.tokenCount ||
                chain.tokens
                  ?.length ||
                0
              ),

            error:
              chain.success
                ? null
                : chain.error ||
                  null,
          })
        );

      /* -------------------------------
         7. FINAL RESPONSE
      ------------------------------- */

      const response = {
        success: true,

        wallet,

        analyzedChains:
          results.length,

        successfulChains:
          results.filter(
            (r) =>
              r.success
          ).length,

        failedChains:
          results.filter(
            (r) =>
              !r.success
          ).length,

        chains:
          chainSummary,

        portfolio,

        security,

        score,

        ai,

        report: {
          wallet,

          chains:
            results.length,

          assets:
            portfolio?.totalTokens ||
            0,

          portfolioValue:
            portfolio?.totalValue ||
            0,

          largestHolding:
            portfolio?.largestHolding ||
            null,

          securityScore:
            score?.score ??
            security?.score ??
            0,

          riskLevel:
            score?.level ||
            security?.level ||
            "UNKNOWN",

          aiAvailable:
            Boolean(
              ai?.available
            ),

          aiReport:
            ai?.report ||
            "AI report unavailable.",
        },

        results,

        meta: {
          generatedAt:
            new Date().toISOString(),

          durationMs:
            Date.now() -
            startedAt,
        },
      };

      console.log("");

      console.log(
        "✅ WALLET ANALYSIS COMPLETE"
      );

      console.log(
        "Chains:",
        response.successfulChains,
        "/",
        response.analyzedChains
      );

      console.log(
        "Tokens:",
        portfolio?.totalTokens ||
          0
      );

      console.log(
        "Portfolio:",
        portfolio?.totalValue ||
          0
      );

      console.log(
        "Risk:",
        response.report.riskLevel
      );

      console.log(
        "AI:",
        response.report.aiAvailable
          ? "OK"
          : "OFF"
      );

      console.log(
        "========================================"
      );

      return res.json(
        response
      );
    } catch (error) {
      console.error(
        "❌ Wallet Engine Error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Wallet analysis failed.",

        portfolio: {
          totalChains: 0,
          totalTokens: 0,
          totalValue: 0,
          largestHolding: null,
          chains: [],
          tokens: [],
        },

        security: {
          score: 0,
          level: "UNKNOWN",
        },

        score: {
          score: 0,
          level: "UNKNOWN",
        },

        ai: {
          available: false,

          report:
            "AI report unavailable.",
        },
      });
    }
  }
);

/* ========================================
   TOKEN MARKET BY ADDRESS
======================================== */

app.get(
  "/api/token/:chain/:address/market",
  async (req, res) => {
    try {
      const {
        chain,
        address,
      } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,

          error:
            "Token address is required.",
        });
      }

      const market =
        await getTokenMarketData(
          address,
          chain
        );

      res.json({
        success: true,

        chain,

        address,

        market,
      });
    } catch (error) {
      res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Market data failed.",
      });
    }
  }
);

/* ========================================
   404
======================================== */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,

      error:
        "Route not found",

      path:
        req.originalUrl,
    });
  }
);

/* ========================================
   ERROR HANDLER
======================================== */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled API error:",
      error
    );

    res.status(500).json({
      success: false,

      error:
        error?.message ||
        "Internal server error.",
    });
  }
);

/* ========================================
   START
======================================== */

app.listen(
  PORT,
  () => {
    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "🚀 TokenOS Backend v2"
    );

    console.log(
      "========================================"
    );

    console.log(
      `📡 http://localhost:${PORT}`
    );

    console.log(
      `💰 http://localhost:${PORT}/api/tokenos`
    );

    console.log(
      `⛓️ http://localhost:${PORT}/api/tokenos/onchain`
    );

    console.log(
      `👛 POST http://localhost:${PORT}/api/analyze-v2`
    );

    console.log(
      `📊 http://localhost:${PORT}/api/tokens`
    );

    console.log(
      `📡 http://localhost:${PORT}/api/radar`
    );

    console.log(
      `🎁 http://localhost:${PORT}/api/airdrops`
    );

    console.log(
      "========================================"
    );
  }
);