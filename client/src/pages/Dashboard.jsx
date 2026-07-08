import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import StatsCards from "../components/StatsCards";
import AnalyticsPanel from "../components/AnalyticsPanel";
import ChartsPanel from "../components/ChartsPanel";
import AIInsights from "../components/AIInsights";
import TokenTable from "../components/TokenTable";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
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


{/* Analytics */}
<div className="mb-8">
  <AnalyticsPanel />
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
                    98%
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">
                    Risk Level
                  </p>
                  <h3 className="text-green-400 font-bold">
                    LOW
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">
                    Whale Activity
                  </p>
                  <h3 className="text-orange-400 font-bold">
                    Normal
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Token Table */}
          <TokenTable />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;