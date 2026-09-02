import { Link } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";

export default function Developers() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">API</p>
        <h1 className="mt-3 text-4xl font-semibold">TokenOS Research API</h1>
        <p className="mt-4 text-lg leading-7 text-slate-400">
          Metered on the Research Desk plan.
        </p>

        <pre className="mt-10 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-300">{`curl -X POST http://localhost:5000/api/analyze-v2 \\
  -H "Authorization: Bearer tos_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"wallet":"0x..."}'`}</pre>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Doc title="POST /api/analyze-v2" body="Multi-chain holdings, risk, AI brief." />
          <Doc title="GET /api/billing/account" body="Plan, quota, referral code." />
          <Doc title="POST /api/premium/ai-report" body="Pay-per-report via x402 USDC." />
          <Doc title="GET /api/airdrops/wallet/:wallet" body="Airdrop radar scan." />
        </div>

        <Link
          to="/pricing"
          className="mt-10 inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          See Desk pricing
        </Link>
      </section>
      <PublicFooter />
    </div>
  );
}

function Doc({ title, body }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="font-mono text-sm text-cyan-300">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
    </div>
  );
}