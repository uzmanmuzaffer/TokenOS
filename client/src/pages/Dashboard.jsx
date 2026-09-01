import { useState } from "react";
import { Search } from "lucide-react";

import useWalletStore from "../store/walletStore";
import useWalletSync from "../wallet/hooks/useWalletSync";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import AnalyticsPanel from "../components/AnalyticsPanel";
import ChartsPanel from "../components/ChartsPanel";
import AIInsights from "../components/AIInsights";
import TokenTable from "../components/TokenTable";
import WalletAnalyzer from "../components/WalletAnalyzer";

import MultiChainAssets from "../components/wallet/MultiChainAssets";

import PortfolioOverview from "../components/dashboard/PortfolioOverview";
import WalletScore from "../components/dashboard/WalletScore";
import RiskGauge from "../components/dashboard/RiskGauge";
import SecurityAlerts from "../components/dashboard/SecurityAlerts";
import TrendingTokens from "../components/dashboard/TrendingTokens";
import CryptoNews from "../components/dashboard/CryptoNews";

function Dashboard() {
  useWalletSync();

  const { data: walletData, wallet, setWallet, analyze, loading } =
    useWalletStore();

  const [query, setQuery] = useState(wallet || "");

  function handleQuickAnalyze(e) {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    setWallet(value);
    analyze(value);
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white lg:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Terminal
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Overview
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Scan a wallet, then review risk, holdings and market context.
              </p>
            </div>

            <form
              onSubmit={handleQuickAnalyze}
              className="flex w-full max-w-xl gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Paste wallet address (0x...)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? "Scanning..." : "Scan"}
              </button>
            </form>
          </div>

          {!walletData && (
            <div className="mb-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center">
              <p className="text-lg font-medium">No wallet scanned yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Paste an address above to load holdings, risk and AI context.
              </p>
            </div>
          )}

          <section className="mb-6">
            <StatsCards />
          </section>

          <section className="mb-6">
            <PortfolioOverview data={walletData} />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WalletScore />
            <RiskGauge />
          </section>

          <section className="mb-6">
            <WalletAnalyzer />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AIInsights data={walletData} />
            <SecurityAlerts />
          </section>

          <section className="mb-6">
            <MultiChainAssets data={walletData} />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AnalyticsPanel />
            <ChartsPanel />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TrendingTokens />
            <CryptoNews />
          </section>

          <section className="mb-6">
            <TokenTable />
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;