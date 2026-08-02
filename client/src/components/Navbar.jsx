import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

import WalletButton from "../wallet/components/WalletButton";
import PremiumButton from "./premium/PremiumButton";
import PremiumModal from "./premium/PremiumModal";

import {
  registerVisit,
  getVisitors,
} from "../services/visitorService";

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
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-5 transition duration-300 hover:opacity-90"
          >
            <img
              src="/brand/logo-512.png"
              alt="TokenOS Logo"
              className="
                h-[72px]
                w-[72px]
                object-contain
                transition-transform
                duration-300
                hover:scale-110
                drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]
              "
            />

            <div className="leading-tight">
              <h1 className="text-4xl font-black tracking-tight text-white">
                Token<span className="text-cyan-400">OS</span>
              </h1>

              <p className="mt-1 text-xs uppercase tracking-[0.35em] text-cyan-400">
                AI Powered Crypto Terminal
              </p>
            </div>
          </Link>

          {/* Right Menu */}
          <div className="flex items-center gap-4">

            {/* Users */}
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur">

              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                Users
              </div>

              <div className="flex items-center gap-2 text-lg font-bold text-cyan-400">
                👥
                {visitors.toLocaleString("tr-TR")}
              </div>

            </div>

            {/* Premium */}
            <PremiumButton
              onClick={() => setPremiumOpen(true)}
            />

            {/* Wallet */}
            <WalletButton />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="
                rounded-xl
                bg-gradient-to-r
                from-red-600
                to-red-500
                px-5
                py-2.5
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-105
                hover:from-red-700
                hover:to-red-600
              "
            >
              Logout
            </button>

          </div>
        </div>
      </nav>

      <PremiumModal
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}

export default Navbar;