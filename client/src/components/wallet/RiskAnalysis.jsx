export default function RiskAnalysis({ riskScore }) {
  if (!riskScore) return null;

  const levelColor =
    riskScore.level === "LOW"
      ? "text-green-400"
      : riskScore.level === "MEDIUM"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Wallet Risk Analysis
      </h3>

      <div className="flex items-center gap-6">
        <div className="text-5xl font-bold text-cyan-400">
          {riskScore.score}
        </div>

        <div>
          <p className="text-slate-400">
            Overall Risk Level
          </p>

          <p className={`text-2xl font-bold ${levelColor}`}>
            {riskScore.level}
          </p>
        </div>
      </div>

      {riskScore.reasons?.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-white mb-3">
            Analysis
          </h4>

          <ul className="space-y-2">
            {riskScore.reasons.map((reason, index) => (
              <li
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300"
              >
                ✅ {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}