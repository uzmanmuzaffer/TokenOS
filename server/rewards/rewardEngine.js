const REWARD_CONFIG = {
  TOKEN_SCAN: 10,
  WALLET_ANALYSIS: 25,
  AIRDROP_SCAN: 20,
  AI_ANALYSIS: 15,
  REFERRAL: 500,
  DAILY_LIMIT: 1000
};

const userRewards = new Map();

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getUser(userId) {
  if (!userRewards.has(userId)) {
    userRewards.set(userId, {
      userId,
      points: 0,
      dailyEarned: 0,
      lastRewardDate: getToday(),
      activities: {},
      referrals: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  const user = userRewards.get(userId);

  if (user.lastRewardDate !== getToday()) {
    user.dailyEarned = 0;
    user.lastRewardDate = getToday();
    user.activities = {};
  }

  return user;
}

export function addReward(userId, activity) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!REWARD_CONFIG[activity]) {
    throw new Error(`Unknown reward activity: ${activity}`);
  }

  const user = getUser(userId);
  const rewardAmount = REWARD_CONFIG[activity];
  const remaining = REWARD_CONFIG.DAILY_LIMIT - user.dailyEarned;

  if (remaining <= 0) {
    return {
      success: false,
      reason: "DAILY_LIMIT_REACHED",
      reward: 0,
      points: user.points
    };
  }

  const actualReward = Math.min(rewardAmount, remaining);

  user.points += actualReward;
  user.dailyEarned += actualReward;

  user.activities[activity] =
    (user.activities[activity] || 0) + 1;

  user.updatedAt = new Date().toISOString();

  return {
    success: true,
    activity,
    reward: actualReward,
    points: user.points,
    dailyEarned: user.dailyEarned,
    dailyRemaining:
      REWARD_CONFIG.DAILY_LIMIT - user.dailyEarned
  };
}

export function getRewardBalance(userId) {
  const user = getUser(userId);

  return {
    success: true,
    userId: user.userId,
    points: user.points,
    dailyEarned: user.dailyEarned,
    dailyRemaining:
      REWARD_CONFIG.DAILY_LIMIT - user.dailyEarned,
    activities: user.activities,
    referrals: user.referrals
  };
}

export function addReferralReward(userId) {
  const result = addReward(userId, "REFERRAL");

  if (result.success) {
    const user = getUser(userId);
    user.referrals += 1;
  }

  return result;
}

export function getRewardStats() {
  let totalPoints = 0;

  for (const user of userRewards.values()) {
    totalPoints += user.points;
  }

  return {
    success: true,
    totalUsers: userRewards.size,
    totalPoints
  };
}

export function getRewardConfig() {
  return {
    success: true,
    rewards: {
      tokenScan: REWARD_CONFIG.TOKEN_SCAN,
      walletAnalysis: REWARD_CONFIG.WALLET_ANALYSIS,
      airdropScan: REWARD_CONFIG.AIRDROP_SCAN,
      aiAnalysis: REWARD_CONFIG.AI_ANALYSIS,
      referral: REWARD_CONFIG.REFERRAL
    },
    dailyLimit: REWARD_CONFIG.DAILY_LIMIT
  };
}