
import { createClient } from "@supabase/supabase-js";

// ============================================
// REWARD CONFIG
// ============================================

const REWARD_CONFIG = {
  TOKEN_SCAN: 10,
  WALLET_ANALYSIS: 25,
  AIRDROP_SCAN: 20,
  AI_ANALYSIS: 15,
  REFERRAL: 500,
  DAILY_LIMIT: 1000,
};

// ============================================
// SUPABASE
// ============================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn("⚠️ SUPABASE_URL is missing");
}

if (!supabaseServiceKey) {
  console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabase = createClient(
  supabaseUrl || "",
  supabaseServiceKey || ""
);

// ============================================
// ADD REWARD
// ============================================

export async function addReward(userId, activity) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!REWARD_CONFIG[activity]) {
    throw new Error(`Unknown reward activity: ${activity}`);
  }

  const rewardAmount = REWARD_CONFIG[activity];

  const { data, error } = await supabase.rpc(
    "add_reward_atomic",
    {
      p_user_id: String(userId),
      p_activity: activity,
      p_reward_amount: rewardAmount,
      p_daily_limit: REWARD_CONFIG.DAILY_LIMIT,
      p_is_referral: false,
    }
  );

  if (error) {
    console.error("❌ Supabase add reward error:", error);

    throw new Error(
      error.message || "Failed to add reward"
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error("Reward response is empty");
  }

  return {
    success: result.success,
    reason: result.reason || null,
    activity,
    reward: result.reward || 0,
    points: result.points || 0,
    dailyEarned: result.daily_earned || 0,
    dailyRemaining: result.daily_remaining || 0,
    referrals: result.referrals || 0,
  };
}

// ============================================
// GET REWARD BALANCE
// ============================================

export async function getRewardBalance(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const { data, error } = await supabase.rpc(
    "get_reward_balance",
    {
      p_user_id: String(userId),
      p_daily_limit: REWARD_CONFIG.DAILY_LIMIT,
    }
  );

  if (error) {
    console.error(
      "❌ Supabase reward balance error:",
      error
    );

    throw new Error(
      error.message || "Failed to get reward balance"
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error("Reward balance response is empty");
  }

  return {
    success: true,
    userId: String(userId),
    points: result.points || 0,
    dailyEarned: result.daily_earned || 0,
    dailyRemaining: result.daily_remaining || 0,
    activities: result.activities || {},
    referrals: result.referrals || 0,
  };
}

// ============================================
// REFERRAL REWARD
// ============================================

export async function addReferralReward(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const rewardAmount = REWARD_CONFIG.REFERRAL;

  const { data, error } = await supabase.rpc(
    "add_reward_atomic",
    {
      p_user_id: String(userId),
      p_activity: "REFERRAL",
      p_reward_amount: rewardAmount,
      p_daily_limit: REWARD_CONFIG.DAILY_LIMIT,
      p_is_referral: true,
    }
  );

  if (error) {
    console.error(
      "❌ Supabase referral reward error:",
      error
    );

    throw new Error(
      error.message || "Failed to add referral reward"
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error("Referral reward response is empty");
  }

  return {
    success: result.success,
    reason: result.reason || null,
    activity: "REFERRAL",
    reward: result.reward || 0,
    points: result.points || 0,
    dailyEarned: result.daily_earned || 0,
    dailyRemaining: result.daily_remaining || 0,
    referrals: result.referrals || 0,
  };
}

// ============================================
// REWARD STATS
// ============================================

export async function getRewardStats() {
  const { data, error } = await supabase
    .from("user_rewards")
    .select("points");

  if (error) {
    console.error(
      "❌ Supabase reward stats error:",
      error
    );

    throw new Error(
      error.message || "Failed to get reward stats"
    );
  }

  const users = data || [];

  const totalPoints = users.reduce(
    (total, user) =>
      total + Number(user.points || 0),
    0
  );

  return {
    success: true,
    totalUsers: users.length,
    totalPoints,
  };
}

// ============================================
// REWARD CONFIG
// ============================================

export function getRewardConfig() {
  return {
    success: true,

    rewards: {
      tokenScan: REWARD_CONFIG.TOKEN_SCAN,
      walletAnalysis: REWARD_CONFIG.WALLET_ANALYSIS,
      airdropScan: REWARD_CONFIG.AIRDROP_SCAN,
      aiAnalysis: REWARD_CONFIG.AI_ANALYSIS,
      referral: REWARD_CONFIG.REFERRAL,
    },

    dailyLimit: REWARD_CONFIG.DAILY_LIMIT,
  };
}

