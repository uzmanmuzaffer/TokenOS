export default function AIWalletReport({ report }) {
  if (!report?.success) return null;

  return (
    <div className="mt-8 bg-slate-900 border border-purple-500 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-purple-400 mb-6">
        🤖 AI Wallet Report
      </h3>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">
            Security Score
          </p>

          <p className="text-3xl font-bold text-green-400">
            {report.risk?.score ?? "--"}/100
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">
            Risk Level
          </p>

          <p className="text-3xl font-bold text-green-400">
            {report.risk?.level ?? "--"}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">
            Tokens
          </p>

          <p className="text-3xl font-bold text-white">
            {report.portfolio?.tokenCount ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 whitespace-pre-line leading-relaxed text-slate-300">
        {report.aiReport}
      </div>
    </div>
  );
}