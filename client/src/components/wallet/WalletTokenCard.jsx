export default function WalletTokenCard({ token }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:border-cyan-500 transition-colors">
      <div>
        <h4 className="text-white font-semibold">
          {token?.name || "Unknown Token"}
        </h4>

        <p className="text-slate-400 text-sm">
          {token?.symbol || "-"}
        </p>
      </div>

      <div className="text-right">
        <p className="text-slate-500 text-sm">
          Decimals
        </p>

        <p className="text-white font-bold">
          {token?.decimals ?? "-"}
        </p>
      </div>
    </div>
  );
}