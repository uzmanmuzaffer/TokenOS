import {
  FaBell,
  FaSearch,
  FaCircle,
  FaUserCircle,
} from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import WalletButton from "../wallet/components/WalletButton";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav
      className="w-full h-20 px-8 flex items-center justify-between
      bg-slate-950/80 backdrop-blur-xl border-b border-slate-800"
    >
      {/* Left */}
      <div>
        <h1 className="text-xl font-bold text-white">
          TokenOS
        </h1>

        <p className="text-xs text-slate-400">
          AI Crypto Intelligence Platform
        </p>
      </div>

      {/* Search */}
      <div
        className="hidden md:flex items-center
        bg-slate-900 border border-slate-800
        rounded-xl px-4 py-2 w-96"
      >
        <FaSearch className="text-slate-500 mr-3" />

        <input
          type="text"
          placeholder="Search token, wallet..."
          className="bg-transparent outline-none
          text-sm text-white w-full
          placeholder:text-slate-500"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* API Status */}
        <div
          className="flex items-center gap-2
          bg-slate-900 px-3 py-2 rounded-xl"
        >
          <FaCircle className="text-green-400 text-xs" />

          <span className="text-sm text-slate-300">
            Online
          </span>
        </div>

        {/* Notification */}
        <button
          className="relative text-slate-400
          hover:text-white transition"
        >
          <FaBell size={20} />

          <span
            className="
            absolute -top-2 -right-2
            w-4 h-4 rounded-full
            bg-cyan-500 text-[10px]
            flex items-center justify-center
            text-white"
          >
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <WalletButton />
          <FaUserCircle
            size={32}
            className="text-slate-400"
          />

          <div className="hidden lg:block">
            <p className="text-sm text-white">
              {auth.currentUser?.email || "User"}
            </p>

            <p className="text-xs text-slate-500">
              Free Plan
            </p>
          </div>
        </div>

        {/* Web3 Wallet */}
        

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;