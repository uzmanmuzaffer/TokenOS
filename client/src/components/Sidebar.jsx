import {
  FaChartLine,
  FaCoins,
  FaChartPie,
  FaWallet,
  FaBell,
  FaCog,
  FaRobot,
} from "react-icons/fa";

const menuItems = [
  { icon: <FaChartLine />, title: "Dashboard" },
  { icon: <FaCoins />, title: "Tokens" },
  { icon: <FaChartPie />, title: "Analytics" },
  { icon: <FaRobot />, title: "AI Insights" },
  { icon: <FaWallet />, title: "Wallet" },
  { icon: <FaBell />, title: "Alerts" },
  { icon: <FaCog />, title: "Settings" },
];

function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-cyan-400">
          TokenOS
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          AI Powered Crypto Terminal
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.title}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      <div className="p-5 border-t border-slate-800">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm text-slate-400">
            Version
          </p>

          <h2 className="text-white font-semibold mt-1">
            TokenOS v2.0
          </h2>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;