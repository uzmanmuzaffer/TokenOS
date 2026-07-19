import useWalletStore from "../store/walletStore";
import MultiChainAssets from "../components/wallet/MultiChainAssets";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import StatsCards from "../components/StatsCards";
import AnalyticsPanel from "../components/AnalyticsPanel";
import ChartsPanel from "../components/ChartsPanel";
import AIInsights from "../components/AIInsights";
import TokenTable from "../components/TokenTable";
import TrendingTokens from "../components/dashboard/TrendingTokens";
import CryptoNews from "../components/dashboard/CryptoNews";
import WalletAnalyzer from "../components/WalletAnalyzer";
import SecurityAlerts from "../components/dashboard/SecurityAlerts";

import PortfolioOverview from "../components/dashboard/PortfolioOverview";

function Dashboard() {
  // Merkezi state
  const { data: walletData } = useWalletStore();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">

          {/* Hero */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Token Analytics Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              AI destekli blockchain analiz platformu
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Portfolio Overview */}
          <div className="mb-8">
            <PortfolioOverview data={walletData} />
          </div>

          {/* Analytics */}
          <div className="mb-8">
            <AnalyticsPanel />
          </div>

          {/* Charts */}
          <div className="mb-8">
            <ChartsPanel />
          </div>

          {/* AI Insights */}
          <div className="mb-8">
            <AIInsights data={walletData} />
          </div>

          {/* Market Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

            <div className="xl:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6">

              <h2 className="text-xl font-semibold mb-2">
                Market Overview
              </h2>

              <p className="text-slate-400">
                Grafikler bu alanda gösterilecek.
              </p>

              <div className="mt-6 h-64 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                Chart Coming Soon
              </div>

            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">

              <h2 className="text-xl font-semibold mb-4">
                AI Insights
              </h2>

              <div className="space-y-4">

                <div className="rounded-xl bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">
                    AI Score
                  </p>

                  <h3 className="text-3xl font-bold text-cyan-400">
                    {walletData?.riskScore?.score ?? "98"}%
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">
                    Risk Level
                  </p>

                  <h3 className="font-bold text-green-400">
                    {walletData?.riskScore?.level ?? "LOW"}
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">
                    Whale Activity
                  </p>

                  <h3 className="font-bold text-orange-400">
                    Normal
                  </h3>
                </div>

              </div>

            </div>

          </div>

          {/* Wallet Analyzer */}
          <div className="mb-8">
            <WalletAnalyzer />
            
          </div>
          {/* Multi Chain Assets */}
<div className="mb-8">
  <MultiChainAssets data={walletData} />
</div>
          {/* Security Alerts */}
<div className="mb-8">
  <SecurityAlerts />
</div>
<div className="mb-8">
  <TrendingTokens />
</div>
          {/* Token Table */}
          <TokenTable />

        </main>
      </div>
    </div>
  );
}

export default Dashboard;