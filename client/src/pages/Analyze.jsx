import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import WalletAnalyzer from "../components/WalletAnalyzer";
import useWalletStore from "../store/walletStore";

export default function Analyze() {
  const [params] = useSearchParams();
  const analyze = useWalletStore((s) => s.analyze);
  const address = params.get("address");

  useEffect(() => {
    if (address) {
      analyze(address);
    }
  }, [address, analyze]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            Public scanner
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Wallet analyzer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Paste an address to scan holdings and risk. Create an account if you
            want the full terminal with radar, news and saved workspace.
          </p>
        </div>

        <WalletAnalyzer />
      </main>

      <PublicFooter />
    </div>
  );
}