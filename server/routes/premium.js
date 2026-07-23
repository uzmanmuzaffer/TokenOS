import express from "express";
import { x402Middleware } from "../providers/x402/index.js";
import { buildPremiumReport } from "../services/ai.js";

const router = express.Router();

router.post(
  "/ai-report",

  x402Middleware,

  async (req, res) => {
    try {
      const { wallet } = req.body;

      if (!wallet) {
        return res.status(400).json({
          success: false,
          error: "Wallet address required",
        });
      }

      const report = await buildPremiumReport(wallet);

      res.json({
        success: true,
        premium: true,
        report,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

export default router;