import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  [
    "text-sm transition",
    isActive ? "text-white" : "text-slate-400 hover:text-white",
  ].join(" ");

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/brand/logo-512.png"
            alt="TokenOS"
            className="h-9 w-9 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-lg font-semibold tracking-tight">
            Token<span className="text-cyan-400">OS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/analyze" className={navLinkClass}>
            Analyzer
          </NavLink>
          <a href="/#features" className="text-sm text-slate-400 hover:text-white">
            Features
          </a>
          <a href="/#how-it-works" className="text-sm text-slate-400 hover:text-white">
            How it works
          </a>
          <NavLink to="/pricing" className={navLinkClass}>
            Pricing
          </NavLink>
          <NavLink to="/developers" className={navLinkClass}>
            API
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm text-slate-300 hover:text-white sm:inline"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}