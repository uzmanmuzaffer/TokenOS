import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import StatsCards from "../components/StatsCards";
import TokenTable from "../components/TokenTable";

function Dashboard() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mt-10">
          Token Analytics Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          AI destekli blockchain token analiz platformu
        </p>

        <SearchBar />

        <StatsCards />

        <TokenTable />
      </main>
    </div>
  );
}

export default Dashboard;