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

          {/* Stats */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Portfolio */}
          <div className="mb-8">
            <PortfolioOverview data={walletData} />
          </div>

          {/* Wallet Score & Risk */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WalletScore />
            <RiskGauge />
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

          {/* Market */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <TrendingTokens />
            <CryptoNews />
          </div>

          {/* Token Table */}
          <div className="mb-8">
            <TokenTable />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;