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

  return (
    <div className="bg-slate-950 rounded-2xl p-8 shadow-xl text-white">

      <WalletHeader
        wallet={data?.wallet}
        chain={data?.chain}
        tokenCount={data?.tokenCount}
      />

      <div className="flex gap-3 mt-8">

        <input
          className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-700 outline-none"
          placeholder="0x Wallet Address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        <button
          onClick={analyze}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 rounded-lg font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <button
          onClick={generateAIReport}
          disabled={aiLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 rounded-lg font-semibold"
        >
          {aiLoading ? "Generating..." : "AI Report"}
        </button>

      </div>

      {error && (
        <div className="mt-6 bg-red-900/40 border border-red-700 rounded-xl p-4">
          <div className="font-bold text-red-400">
            Error
          </div>

          <div className="text-red-300 mt-2">
            {error}
          </div>
        </div>
      )}

      <WalletSummary data={data} />

      <RiskAnalysis riskScore={data?.riskScore} />

      <AIWalletReport report={aiReport} />

      {data?.success && (
        <div className="mt-8">

          <h3 className="text-2xl font-bold mb-4">
            Token Portfolio
          </h3>

          <div className="space-y-3">

            {data.tokens?.map((token, index) => (
              <WalletTokenCard
                key={`${token.symbol}-${index}`}
                token={token}
              />
            ))}

          </div>

        </div>
      )}

    </div>
  );
}