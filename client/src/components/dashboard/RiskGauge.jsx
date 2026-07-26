import { ShieldAlert } from "lucide-react";
import useWalletStore from "../../store/walletStore";

export default function RiskGauge() {
  const { data } = useWalletStore();

  const score = data?.riskScore?.score ?? 98;
  const level = data?.riskScore?.level ?? "LOW";

  const getConfig = () => {
    switch (level.toUpperCase()) {
      case "LOW":
        return {
          color: "text-green-400",
          bg: "bg-green-500",
          message: "Your portfolio appears healthy.",
        };

      case "MEDIUM":
        return {
          color: "text-yellow-400",
          bg: "bg-yellow-500",
          message: "Some assets may require attention.",
        };

      case "HIGH":
        return {
          color: "text-red-400",
          bg: "bg-red-500",
          message: "High portfolio risk detected.",
        };

      default:
        return {
          color: "text-slate-300",
          bg: "bg-slate-500",
          message: "Risk analysis unavailable.",
        };
    }
  };

  const config = getConfig();

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Risk Analysis</p>

          <h2 className={`text-4xl font-bold mt-2 ${config.color}`}>
            {level}
          </h2>

          <p className="text-slate-500 mt-2">
            Risk Score: <span className="font-semibold">{score}/100</span>
          </p>

          <p className="text-slate-400 mt-4 text-sm">
            {config.message}
          </p>
        </div>

        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${config.bg}`}
        >
          <ShieldAlert size={30} className="text-white" />
        </div>
      </div>
    </div>
  );
}