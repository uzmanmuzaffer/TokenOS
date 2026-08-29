
import {
  FaChartLine,
  FaGift,
  FaWallet,
  FaRobot,
  FaShieldAlt,
  FaCoins,
} from "react-icons/fa";

const menuItems = [
  {
    icon: <FaChartLine />,
    title: "Dashboard",
    active: true,
  },
  {
    icon: <FaGift />,
    title: "Airdrop Radar",
    badge: "NEW",
  },
  {
    icon: <FaWallet />,
    title: "Wallet Analyzer",
  },
  {
    icon: <FaCoins />,
    title: "Token Radar",
  },
  {
    icon: <FaRobot />,
    title: "AI Insights",
  },
  {
    icon: <FaShieldAlt />,
    title: "Security",
  },
];

function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-cyan-400">
          TokenOS
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          AI Powered Crypto Terminal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        {menuItems.map((item) => (
          <div
            key={item.title}
            className={`
              w-full
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-xl
              border
              transition
              ${
                item.active
                  ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-white"
              }
            `}
          >

            {/* Icon */}
            <span className="text-lg">
              {item.icon}
            </span>

            {/* Title */}
            <span className="font-medium flex-1">
              {item.title}
            </span>

            {/* Badge */}
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {item.badge}
              </span>
            )}

          </div>
        ))}

      </nav>

      {/* Airdrop Radar Info */}
      <div className="px-4 pb-4">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FaGift />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Airdrop Radar
              </p>

              <p className="text-sm font-semibold text-white">
                Discovery Active
              </p>
            </div>

          </div>

          <p className="text-xs text-slate-500 mt-3">
            TokenOS is scanning supported sources for new airdrop opportunities.
          </p>

        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-800">

        <div className="rounded-xl bg-slate-900 p-4">

          <p className="text-sm text-slate-400">
            Version
          </p>

          <h2 className="text-white font-semibold mt-1">
            TokenOS v2.0
          </h2>

          <p className="text-xs text-slate-600 mt-2">
            Scan First. Ape Later.
          </p>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;

