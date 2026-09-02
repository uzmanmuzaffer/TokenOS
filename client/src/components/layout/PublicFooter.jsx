import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">
            Token<span className="text-cyan-400">OS</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered wallet intelligence. Free to start.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-slate-400">
          <Link to="/analyze" className="hover:text-white">
            Analyzer
          </Link>
          <Link to="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link to="/developers" className="hover:text-white">
            API
          </Link>
          <Link to="/login" className="hover:text-white">
            Login
          </Link>
        </div>

        <p className="text-sm text-slate-600">© 2026 TokenOS</p>
      </div>
    </footer>
  );
}