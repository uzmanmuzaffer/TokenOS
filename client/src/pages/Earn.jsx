import { useEffect, useState } from "react";
import {
  getRewardBalance,
  getRewardConfig,
} from "../services/api";

const DEFAULT_CONFIG = {
  tokenScan: 10,
  walletAnalysis: 25,
  airdropScan: 20,
  aiAnalysis: 15,
  referral: 500,
  dailyLimit: 1000,
};

const ACTIVITIES = [
  {
    key: "TOKEN_SCAN",
    title: "Token Scan",
    description: "Scan Base tokens and discover opportunities.",
    points: "tokenScan",
    icon: "🔎",
  },
  {
    key: "WALLET_ANALYSIS",
    title: "Wallet Analysis",
    description: "Analyze a wallet with TokenOS.",
    points: "walletAnalysis",
    icon: "👛",
  },
  {
    key: "AIRDROP_SCAN",
    title: "Airdrop Scan",
    description: "Scan your wallet for airdrop opportunities.",
    points: "airdropScan",
    icon: "🪂",
  },
  {
    key: "AI_ANALYSIS",
    title: "AI Analysis",
    description: "Use TokenOS AI analysis.",
    points: "aiAnalysis",
    icon: "🤖",
  },
];

function Earn() {
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUserId =
      localStorage.getItem("tokenos_user_id");

    if (savedUserId) {
      setUserId(savedUserId);
    } else {
      const newUserId =
        "user-" +
        Math.random()
          .toString(36)
          .substring(2, 12);

      localStorage.setItem(
        "tokenos_user_id",
        newUserId
      );

      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    loadRewards(userId);
  }, [userId]);

  async function loadRewards(id) {
    setLoading(true);
    setError("");

    try {
      const [balanceResult, configResult] =
        await Promise.all([
          getRewardBalance(id),
          getRewardConfig(),
        ]);

      if (balanceResult?.success) {
        setBalance(balanceResult);
      } else {
        setError(
          balanceResult?.error ||
            "Reward balance could not be loaded."
        );
      }

      if (configResult?.success) {
        setConfig({
          ...DEFAULT_CONFIG,
          ...(configResult.rewards || {}),
          dailyLimit:
            configResult.dailyLimit ||
            DEFAULT_CONFIG.dailyLimit,
        });
      }
    } catch (err) {
      console.error(
        "Earn page error:",
        err
      );

      setError(
        err?.message ||
          "Rewards could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  const points =
    Number(balance?.points || 0);

  const dailyEarned =
    Number(balance?.dailyEarned || 0);

  const dailyRemaining =
    Number(
      balance?.dailyRemaining ??
        Math.max(
          0,
          config.dailyLimit - dailyEarned
        )
    );

  const progress =
    config.dailyLimit > 0
      ? Math.min(
          100,
          (dailyEarned /
            config.dailyLimit) *
            100
        )
      : 0;

  function getActivityCount(key) {
    return Number(
      balance?.activities?.[key] || 0
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-400 font-semibold mb-2">
                TOKENOS REWARDS
              </p>

              <h1 className="text-3xl md:text-4xl font-bold">
                Earn Points
              </h1>

              <p className="text-slate-400 mt-2">
                Use TokenOS, complete activities and
                earn rewards.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="text-xs text-slate-500">
                Your Reward ID
              </p>

              <p className="text-sm font-mono text-slate-300 mt-1 break-all">
                {userId || "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Total Points
            </p>

            <p className="text-4xl font-bold mt-2 text-emerald-400">
              {loading ? "..." : points.toLocaleString()}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              TokenOS reward points
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Earned Today
            </p>

            <p className="text-4xl font-bold mt-2">
              {loading
                ? "..."
                : dailyEarned.toLocaleString()}
            </p>

            <div className="mt-4">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>
                  {dailyEarned.toLocaleString()} earned
                </span>

                <span>
                  {config.dailyLimit.toLocaleString()} daily
                  limit
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Remaining Today
            </p>

            <p className="text-4xl font-bold mt-2 text-cyan-400">
              {loading
                ? "..."
                : dailyRemaining.toLocaleString()}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Points available today
            </p>
          </div>
        </div>

        {/* ACTIVITIES */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">
                Earn Activities
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Complete real TokenOS actions to earn points.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTIVITIES.map((activity) => {
              const reward =
                Number(
                  config[activity.points] || 0
                );

              const count =
                getActivityCount(
                  activity.key
                );

              return (
                <div
                  key={activity.key}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                        {activity.icon}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          {activity.title}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-emerald-400">
                        +{reward}
                      </p>

                      <p className="text-xs text-slate-600">
                        points
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Completed: {count}
                    </span>

                    <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400">
                      Activity
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REFERRAL */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-emerald-400 font-semibold">
                REFERRAL PROGRAM
              </p>

              <h2 className="text-2xl font-bold mt-2">
                Invite friends. Earn more.
              </h2>

              <p className="text-slate-400 mt-2 max-w-2xl">
                Share your TokenOS referral link and
                earn{" "}
                <span className="text-emerald-400 font-bold">
                  +{config.referral}
                </span>{" "}
                points when a valid referral is completed.
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-slate-950/70 border border-slate-800 px-6 py-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">
                +{config.referral}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                points / referral
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            Daily reward limit:{" "}
            {config.dailyLimit.toLocaleString()} points
          </p>
        </div>
      </div>
    </div>
  );
}

export default Earn;