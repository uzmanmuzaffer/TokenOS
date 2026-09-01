import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

import WalletButton from "../wallet/components/WalletButton";
import PremiumButton from "./premium/PremiumButton";
import PremiumModal from "./premium/PremiumModal";

import { registerVisit, getVisitors } from "../services/visitorService";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    async function loadVisitors() {
      try {
        await registerVisit();
        const total = await getVisitors();
        setVisitors(total);
      } catch (err) {
        console.error("Visitor Error:", err);
      }
    }

    loadVisitors();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/dashboard" className="flex items-center gap-3 lg:hidden">
            <img
              src="/brand/logo-512.png"
              alt="TokenOS Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-lg font-semibold">
              Token<span className="text-cyan-400">OS</span>
            </span>
          </Link>

          <div className="hidden items-center gap-4 text-sm text-slate-400 md:flex">
            <Link to="/dashboard" className="hover:text-white">
              Overview
            </Link>
            <Link to="/analyze" className="hover:text-white">
              Analyzer
            </Link>
            <Link to="/airdrop-radar" className="hover:text-white">
              Radar
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <div className="hidden rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 sm:block">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Users
              </div>
              <div className="text-sm font-semibold text-cyan-400">
                {Number(visitors || 0).toLocaleString("en-US")}
              </div>
            </div>

            <PremiumButton onClick={() => setPremiumOpen(true)} />
            <WalletButton />

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-red-500/50 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <PremiumModal isOpen={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}

export default Navbar;