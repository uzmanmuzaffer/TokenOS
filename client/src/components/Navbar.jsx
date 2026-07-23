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

  const openPremium = () => {
    setPremiumOpen(true);
  };

  const closePremium = () => {
    setPremiumOpen(false);
  };

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
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0B1120]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-white"
          >
            Token<span className="text-cyan-400">OS</span>
          </Link>

          {/* Menü */}
          <div className="hidden items-center gap-8 text-slate-300 md:flex">
            <Link
              to="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/markets"
              className="transition hover:text-white"
            >
              Markets
            </Link>

            <Link
              to="/wallet"
              className="transition hover:text-white"
            >
              Wallet
            </Link>

            <Link
              to="/news"
              className="transition hover:text-white"
            >
              News
            </Link>
          </div>

          {/* Sağ Menü */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">
              👥 {visitors}
            </div>

            <PremiumButton onClick={openPremium} />

            <WalletButton />

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <PremiumModal
        isOpen={premiumOpen}
        onClose={closePremium}
      />
    </>
  );
}

export default Navbar;