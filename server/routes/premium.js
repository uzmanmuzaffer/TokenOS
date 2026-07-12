import { Router } from "express";

const router = Router();

router.get("/ai-report", async (req, res) => {
  res.json({
    success: true,
    premium: true,
    feature: "AI Wallet Report",
    message: "Premium route is working.",
    version: "1.0"
  });
});

export default router;