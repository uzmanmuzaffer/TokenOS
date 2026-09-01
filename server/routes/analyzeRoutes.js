
import express from "express";
import { analyzeWallet } from "../controllers/analyzeController.js";

const router = express.Router();

// POST /api/analyze
router.post("/", analyzeWallet);

export default router;

