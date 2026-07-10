import {
  FaWallet,
  FaEthereum,
  FaCheckCircle,
} from "react-icons/fa";

function WalletHeader({
  wallet,
  chain,
  tokenCount,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <FaWallet className="text-cyan-400 text-xl" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            Wallet Analyzer
          </h2>

          <p className="text-slate-400 text-sm">
            AI Powered Portfolio Analysis
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
          <p className="text-slate-500 text-sm">
            Wallet Address
          </p>

          <p className="text-white text-sm mt-2 break-all">
            {wallet || "-"}
          </p>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
          <p className="text-slate-500 text-sm">
            Network
          </p>

          <div className="flex items-center gap-2 mt-2">
            <FaEthereum className="text-cyan-400" />

            <span className="font-semibold">
              {chain || "Ethereum"}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
          <p className="text-slate-500 text-sm">
            Tokens
          </p>

          <div className="flex items-center gap-2 mt-2">
            <FaCheckCircle className="text-green-400" />

            <span className="text-2xl font-bold">
              {tokenCount || 0}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default WalletHeader;