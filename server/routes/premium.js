
import express from "express";

import {
  x402Middleware,
} from "../providers/x402/index.js";

import {
  buildPremiumReport,
} from "../services/ai.js";

const router =
  express.Router();

// ========================================
// PREMIUM AI REPORT
// ========================================
// POST /api/premium/ai-report
//
// Payment:
// $0.05 USDC
//
// Network:
// Base Mainnet
// ========================================

router.post(
  "/ai-report",

  // X402 payment verification
  x402Middleware,

  async (req, res) => {
    try {
      const {
        wallet,
      } = req.body || {};

      // ========================================
      // WALLET VALIDATION
      // ========================================

      if (!wallet) {
        return res.status(400).json({
          success: false,
          premium: false,
          error:
            "Wallet address required",
        });
      }

      console.log(
        "🤖 Premium AI report requested"
      );

      // ========================================
      // AI REPORT
      // ========================================

      const report =
        await buildPremiumReport(
          wallet
        );

      // ========================================
      // RESPONSE
      // ========================================

      return res.json({
        success: true,
        premium: true,
        wallet,
        report,
      });

    } catch (error) {
      console.error(
        "❌ Premium AI Report Error:"
      );

      console.error(
        error?.message || error
      );

      return res.status(500).json({
        success: false,
        premium: false,
        error:
          error?.message ||
          "Premium AI report failed.",
      });
    }
  }
);

export default router;

