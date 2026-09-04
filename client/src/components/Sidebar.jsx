
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Gift,
  Search,
  CreditCard,
  Zap,
} from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analyzer",
    path: "/analyze",
    icon: Search,
  },
  {
    title: "Airdrop Radar",
    path: "/airdrop-radar",
    icon: Zap,
    badge: "New",
  },
  {
    title: "Earn",
    path: "/earn",
    icon: Gift,
    badge: "New",
  },
  {
    title: "Billing",
    path: "/billing",
    icon: CreditCard,
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-800 bg-[#070b14] lg:flex">
      <div className="border-b border-slate-800 p-6">
        <Link to="/dashboard" className="block">
          <h1 className="text-2xl font-semibold tracking-tight">
            Token<span className="text-cyan-400">OS</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
            Crypto terminal
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.title}
              to={item.path}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-cyan-500/10 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span className="flex-1">{item.title}</span>

              {item.badge ? (
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-300">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-500">Workspace</p>
          <p className="mt-1 text-sm font-medium text-white">TokenOS v2.0</p>
          <p className="mt-2 text-xs text-slate-600">
            Scan first. Ape later.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

