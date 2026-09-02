import express from "express";
import {
  changePlan,
  getAccountSnapshot,
  getOrCreateAccount,
  getReferralStats,
  issueApiKey,
  listApiKeys,
  publicCatalog,
} from "../services/billingService.js";
import { extractAccountId } from "../middleware/quota.js";

const router = express.Router();

router.get("/catalog", (_req, res) => {
  res.json({ success: true, ...publicCatalog() });
});

router.get("/account", async (req, res) => {
  try {
    const accountId = extractAccountId(req);
    const snapshot = await getAccountSnapshot(accountId);
    const referral = await getReferralStats(accountId);
    const keys = await listApiKeys(accountId);

    res.json({
      success: true,
      account: {
        id: snapshot.account.id,
        planId: snapshot.account.planId,
        status: snapshot.account.status,
        usage: snapshot.account.usage,
      },
      plan: snapshot.plan,
      referral,
      apiKeys: keys,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/checkout", async (req, res) => {
  try {
    const accountId = extractAccountId(req);
    const planId = String(req.body?.planId || "").trim();
    const paymentRef = req.body?.paymentRef || req.body?.txHash || null;

    await getOrCreateAccount(accountId, {
      referredBy: req.body?.ref || null,
    });

    if (!["pro", "desk", "free"].includes(planId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid planId.",
      });
    }

    const result = await changePlan(accountId, planId, paymentRef);
    res.json({
      success: true,
      message:
        planId === "free"
          ? "Reverted to Explorer."
          : "Plan activated. Wire x402/USDC proof before production.",
      ...result,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/api-keys", async (req, res) => {
  try {
    const accountId = extractAccountId(req);
    const created = await issueApiKey(accountId, req.body?.label || "default");
    res.json({
      success: true,
      warning: "Store this token now. It is not shown again.",
      ...created,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/referrals", async (req, res) => {
  try {
    const stats = await getReferralStats(extractAccountId(req));
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;