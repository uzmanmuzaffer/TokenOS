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
        console.error("Visitor error:", err);
      }
    }

    loadVisitors();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-md">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-8">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-4 transition hover:opacity-90"
          >
            <img
              src="/logo.png"
              alt="TokenOS"
              className="h-16 w-16 rounded-2xl object-contain shadow-xl"
            />

            <div className="leading-tight">
              <h1 className="text-3xl font-extrabold tracking-wide text-white">
                Token<span className="text-cyan-400">OS</span>
              </h1>

              <p className="text-sm text-slate-400">
                AI Blockchain Analytics Platform
              </p>
            </div>
          </Link>

          {/* Sağ Menü */}
          <div className="flex items-center gap-4">

            {/* Visitor Counter */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow">
              👥 {visitors.toLocaleString("tr-TR")}
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
                bg-red-600
                px-5
                py-2.5
                font-medium
                text-white
                transition-all
                hover:bg-red-700
                hover:shadow-lg
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