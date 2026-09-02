export default function AIWalletReport({ report }) {
  if (!report) return null;

  const score = report.score?.score ?? report.security?.score ?? "--";
  const level = report.score?.status || report.score?.level || report.security?.level || "--";
  const tokenCount = report.portfolio?.totalTokens ?? report.portfolio?.tokenCount ?? 0;
  const content = report.content || "AI report unavailable.";

  const levelColor =
    String(level).toUpperCase() === "LOW" || Number(score) >= 70
      ? "text-green-400"
      : String(level).toUpperCase() === "MEDIUM" || Number(score) >= 40
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="mt-8 rounded-2xl border border-purple-500/50 bg-slate-900 p-6">
      <h3 className="mb-6 text-2xl font-bold text-purple-400">
        TokenOS AI Wallet Report
      </h3>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Security Score</p>
          <p className="mt-2 text-2xl font-semibold">{score}/100</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Risk Level</p>
          <p className={`mt-2 text-2xl font-semibold ${levelColor}`}>{level}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Assets Analyzed</p>
          <p className="mt-2 text-2xl font-semibold">{tokenCount}</p>
        </div>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
        {content}
      </div>
    </div>
  );
}