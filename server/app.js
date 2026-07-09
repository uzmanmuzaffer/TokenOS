import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getWalletTokens,
  
} from "./services/moralis.js";
import { getMarketTokens } from "./services/market.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Ana API kontrol
app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "TokenOS API",
    version: "1.0.0",
    status: "running",
  });
});


// Gerçek Market Token API
app.get("/api/tokens", async (req, res) => {

  try {

    const tokens = await getMarketTokens();

    res.json({
      success: true,
      count: tokens.length,
      tokens
    });


  } catch (error) {

    console.error("Token API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});


// Wallet Analyze API
app.post("/api/analyze", async (req, res) => {

  try {

    const { wallet } = req.body;


    if (!wallet) {

      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });

    }


    console.log("🔍 Analyzing:", wallet);


    const tokens = await getWalletTokens(wallet, "eth");


    res.json({
  success: true,
  wallet,
  chain: "Ethereum",
  
  tokenCount: tokens.length,
  tokens,
});


  } catch (error) {

    console.error("Analyze Error:", error);


    res.status(500).json({

      success: false,
      error: error.message,

    });

  }

});


// Server Start
app.listen(PORT, () => {

  console.log(
    `🚀 TokenOS Backend running on http://localhost:${PORT}`
  );

});