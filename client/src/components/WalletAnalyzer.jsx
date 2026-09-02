import { useState } from "react";

import useWalletStore from "../store/walletStore";

import WalletHeader from "./wallet/WalletHeader";
import WalletSummary from "./wallet/WalletSummary";
import WalletTokenCard from "./wallet/WalletTokenCard";
import RiskAnalysis from "./wallet/RiskAnalysis";
import AIWalletReport from "./wallet/AIWalletReport";

export default function WalletAnalyzer() {
  const [showAllTokens, setShowAllTokens] = useState(false);

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
  const tokens = portfolio?.tokens || data?.tokens || [];
  const visibleTokens = showAllTokens ? tokens : tokens.slice(0, 5);
  const failedChains = Array.isArray(data?.chains)
    ? data.chains.filter((chain) => chain?.success === false)
    : [];
  const successfulChains = Number(
    data?.successfulChains ?? portfolio?.totalChains ?? 0
  );
  const scanFailed = successfulChains === 0 && failedChains.length > 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-white shadow-xl">
      <WalletHeader
        wallet={data?.wallet || wallet}
        chain={
          scanFailed
            ? "Scan failed"
            : data?.chain ??
              `${portfolio?.totalChains ?? data?.analyzedChains ?? 0} Chains`
        }
        tokenCount={
          portfolio?.totalTokens ?? data?.tokenCount ?? tokens.length
        }
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Paste wallet address (0x...)"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 p-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
        />

        <button
          onClick={() => analyze(wallet)}
          disabled={loading || !wallet}
          className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <button
          onClick={generateAIReport}
          disabled={aiLoading || !data || scanFailed}
          className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {aiLoading ? "Generating..." : "AI Report"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-700/60 bg-amber-950/30 p-4">
          <h3 className="font-bold text-amber-300">Data source problem</h3>
          <p className="mt-2 text-sm text-amber-100/90">{error}</p>
          <p className="mt-2 text-xs text-amber-200/70">
            This is not an empty wallet. TokenOS could not read balances from
            the current backend provider. After the public fallback is deployed,
            scan again.
          </p>
        </div>
      )}

      {failedChains.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-medium text-slate-200">Network status</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {failedChains.map((chain) => (
              <p key={chain.chain || chain.chainId} className="text-xs text-slate-400">
                {chain.chain}: {chain.error || "failed"}
              </p>
            ))}
          </div>
        </div>
      )}

      {!scanFailed && (
        <>
          <div className="mt-8">
            <WalletSummary data={data} />
          </div>

          <div className="mt-8">
            <RiskAnalysis security={data?.security} score={data?.score} />
          </div>

          <div className="mt-8">
            <AIWalletReport report={aiReport} scan={data} />
          </div>

          {tokens.length > 0 && (
            <div className="mt-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Token Portfolio</h2>
                <span className="text-sm text-slate-400">
                  {tokens.length} Assets
                </span>
              </div>

              <div className="space-y-3">
                {visibleTokens.map((token, index) => (
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

              {tokens.length > 5 && (
                <button
                  onClick={() => setShowAllTokens(!showAllTokens)}
                  className="mt-5 rounded-lg bg-slate-800 px-5 py-2 text-white hover:bg-slate-700"
                >
                  {showAllTokens
                    ? "Show Less"
                    : `View All ${tokens.length} Tokens`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}