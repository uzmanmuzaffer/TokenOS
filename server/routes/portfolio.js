import express from "express";

import { analyzePortfolio } from "../services/portfolio/PortfolioAnalyzer.js";

// Mevcut Moralis servisini kullan.
// Kendi projendeki dosya adına göre bunu güncelleyeceğiz.
import { getWalletPortfolio } from "../services/moralis.js";

const router = express.Router();

/**
 * POST /api/portfolio/analyze
 */
router.post("/analyze", async (req, res) => {

    try {

        const { wallet } = req.body;

        if (!wallet) {

            return res.status(400).json({

                success: false,

                message: "Wallet address is required."

            });

        }

        // Mevcut Moralis servisini kullan
        const portfolio = await getWalletPortfolio(wallet);

        // AI Core
        const analysis = analyzePortfolio(portfolio);

        return res.json({

            success: true,

            wallet,

            ...analysis

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

export default router;