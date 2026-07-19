import useWalletStore from "../store/walletStore";

import WalletHeader from "./wallet/WalletHeader";
import WalletSummary from "./wallet/WalletSummary";
import WalletTokenCard from "./wallet/WalletTokenCard";
import RiskAnalysis from "./wallet/RiskAnalysis";
import AIWalletReport from "./wallet/AIWalletReport";

export default function WalletAnalyzer() {
  const {
    wallet,
    setWallet,
    data,
    loading,
    aiReport,
    aiLoading,
    error,
    analyze,
    generateAIReport,
  } = useWalletStore();

  const portfolio = data?.portfolio;

  // Yeni API (portfolio.tokens) + Eski API (data.tokens) uyumluluğu
  const tokens = portfolio?.tokens || data?.tokens || [];

  return (
    <div className="bg-slate-950 rounded-2xl p-8 rounded-2xl shadow-xl border border-slate-800 text-white">

      <WalletHeader
        wallet={data?.wallet}
        chain={
          data?.chain ??
          `${portfolio?.totalChains ?? data?.analyzedChains ?? 0} Chains`
        }
        tokenCount={
          portfolio?.totalTokens ??
          data?.tokenCount ??
          tokens.length
        }
      />

      {/* Search */}
      <div className="flex gap-3 mt-8">

        <input
          className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-blue-500"
          placeholder="Enter Wallet Address..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        <button
          onClick={analyze}
          disabled={loading}
          className="px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <button
          onClick={generateAIReport}
          disabled={aiLoading || !data}
          className="px-6 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-semibold transition"
        >
          {aiLoading ? "Generating..." : "AI Report"}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-700 bg-red-900/30 p-4">
          <h3 className="font-bold text-red-400">
            Error
          </h3>

          <p className="mt-2 text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Portfolio Summary */}
      <WalletSummary data={data} />

      {/* Risk */}
      <RiskAnalysis
  security={data?.security}
  score={data?.score}
/>

      {/* AI */}
      <AIWalletReport report={aiReport} />

      {/* Token Portfolio */}
      {tokens.length > 0 && (

        <div className="mt-8">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold">
              Token Portfolio
            </h2>

            <span className="text-sm text-slate-400">
              {tokens.length} Assets
            </span>

          </div>

          <div className="space-y-3">

            {tokens.map((token, index) => (

              <WalletTokenCard
                key={
                  token.address ||
                  token.token_address ||
                  `${token.symbol}-${index}`
                }
                token={token}
              />

            ))}

          </div>

        </div>

      )}

    </div>
  );
}