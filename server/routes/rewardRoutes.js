
import express from "express";

import {
  addReward,
  addReferralReward,
  getRewardBalance,
  getRewardStats,
  getRewardConfig,
} from "../rewards/rewardEngine.js";

const router = express.Router();

/* ========================================
   REWARD BALANCE
======================================== */

router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await getRewardBalance(userId);

    return res.json(result);
  } catch (error) {
    console.error("Reward balance error:", error);

    return res.status(400).json({
      success: false,
      error:
        error?.message ||
        "Failed to get reward balance.",
    });
  }
});

/* ========================================
   EARN REWARD
======================================== */

router.post("/earn", async (req, res) => {
  try {
    const {
      userId,
      activity,
    } = req.body;

    const result = await addReward(
      userId,
      activity
    );

    return res.json(result);
  } catch (error) {
    console.error("Reward earn error:", error);

    return res.status(400).json({
      success: false,
      error:
        error?.message ||
        "Failed to add reward.",
    });
  }
});

/* ========================================
   REFERRAL REWARD
======================================== */

router.post("/referral", async (req, res) => {
  try {
    const { userId } = req.body;

    const result =
      await addReferralReward(userId);

    return res.json(result);
  } catch (error) {
    console.error(
      "Referral reward error:",
      error
    );

    return res.status(400).json({
      success: false,
      error:
        error?.message ||
        "Failed to add referral reward.",
    });
  }
});

/* ========================================
   REWARD STATS
======================================== */

router.get("/stats", async (req, res) => {
  try {
    const result =
      await getRewardStats();

    return res.json(result);
  } catch (error) {
    console.error(
      "Reward stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to get reward stats.",
    });
  }
});

/* ========================================
   REWARD CONFIG
======================================== */

router.get("/config", (req, res) => {
  try {
    const result =
      getRewardConfig();

    return res.json(result);
  } catch (error) {
    console.error(
      "Reward config error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to get reward configuration.",
    });
  }
});

/* ========================================
   EXPORT
======================================== */

export default router;

