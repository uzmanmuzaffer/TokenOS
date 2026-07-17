import { Router } from "express";
import { buildPremiumReport } from "../services/reportBuilder.js";

const router = Router();

router.post(
  "/ai-report",
  async (req, res) => {

    console.log("💎 PREMIUM REQUEST:", req.body);

    try {

      const { wallet } = req.body || {};

      if (!wallet) {
        return res.status(400).json({
          success: false,
          message: "Wallet address required",
        });
      }

      const report = await buildPremiumReport(wallet);

      return res.json({
        success: true,
        ...report,
      });

    } catch (error) {

      console.error("❌ PREMIUM ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });

    }

  }
);

export default router;