import { ShieldCheck } from "lucide-react";

export default function WalletScore({ score = 91 }) {
  const getScoreColor = () => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Risky";
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Wallet Score</p>

          <h2 className={`text-4xl font-bold mt-2 ${getScoreColor()}`}>
            {score}
            <span className="text-xl text-slate-500"> /100</span>
          </h2>

          <p className="mt-3 text-slate-300">
            {getScoreLabel()} Portfolio
          </p>
        </div>

        <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center">
          <ShieldCheck size={30} className="text-white" />
        </div>
      </div>
    </div>
  );
}