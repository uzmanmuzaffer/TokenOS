import express from "express";
import {
  detectWalletAirdrops,
} from "../services/airdropDetector.js";

const router =
  express.Router();

router.get(
  "/:wallet",
  async (req, res) => {
    try {
      const {
        wallet,
      } = req.params;

      const chain =
        req.query.chain ||
        "base";

      const result =
        await detectWalletAirdrops(
          wallet,
          chain
        );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "Airdrop API Error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Airdrop analysis failed.",
      });
    }
  }
);

export default router;