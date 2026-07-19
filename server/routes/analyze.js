import express from "express";
import { analyzeWallet } from "../controllers/analyzeController.js";

const router = express.Router();

// Yeni nesil analiz endpoint'i
router.post("/v2", analyzeWallet);

export default router;