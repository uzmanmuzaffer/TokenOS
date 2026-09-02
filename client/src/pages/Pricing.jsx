import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ShieldAlert } from "lucide-react";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import { billingApi, setBillingAccount } from "../services/billingApi.js";

const fallbackPlans = [
  {
    id: "free",
    name: "Explorer",
    priceUsd: 0,
    badge: "Start free",
    description: "Public research scans. No deposit.",
    features: ["8 wallet scans / day", "2 AI briefs / day", "Basic risk score"],
  },
  {
    id: "pro",
    name: "Pro Desk",
    priceUsd: 19,
    badge: "Most used",
    description: "Daily research workflow with full radar and exports.",
    features: ["200 scans / day", "80 AI briefs / day", "Full Airdrop Radar", "CSV export"],
  },
  {
    id: "desk",
    name: "Research Desk",
    priceUsd: 79,
    badge: "Teams & bots",
    description: "API, webhooks and higher ceilings.",
    features: ["2,000 scans / day", "20,000 API calls / month", "5 seats", "Webhooks"],
  },
];

export default function Pricing() {
  const [plans, setPlans] = useState(fallbackPlans);
  const [notes, setNotes] = useState([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) window.localStorage.setItem("tokenos_ref", ref);

    billingApi
      .catalog()
      .then((data) => {
        if (data.plans?.length) setPlans(data.plans);
        if (data.notes?.length) setNotes(data.notes);
      })
      .catch(() => {});
  }, []);

  async function activate(planId) {
    setBusy(planId);
    setMessage("");
    try {
      const email = window.localStorage.getItem("tokenos_account");
      if (!email) {
        const entered = window.prompt("Planı hesaba bağlamak için e-posta:");
        if (!entered) return;
        setBillingAccount(entered);
      }
      const result = await billingApi.checkout(planId);
      setMessage(result.message || "Plan güncellendi.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
          Revenue model
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Research software, not a yield product.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-400">
          TokenOS earns from subscriptions, metered AI reports and API usage.
          There is no staking APY, no guaranteed airdrop and no deposit vault on this site.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] uppercase text-cyan-300">
                  {plan.badge}
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold">
                ${plan.priceUsd}
                <span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                {(plan.features || []).map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => activate(plan.id)}
                disabled={Boolean(busy)}
                className="mt-8 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
              >
                {busy === plan.id ? "Updating..." : plan.priceUsd ? "Activate plan" : "Stay on Explorer"}
              </button>
            </article>
          ))}
        </div>

        {message ? (
          <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
            {message}
          </p>
        ) : null}

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold">Pay-per-report</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Deep AI wallet report is $0.99 USDC via x402. Use it when you do not want a monthly plan.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold">Referral</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Share your desk. You earn 20% of a referred account’s first paid month. Payout is USDC, not TOS inflation.
            </p>
            <Link to="/billing" className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300">
              Open billing desk →
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-100/80">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-200">What this is not</p>
            <p className="mt-1 text-amber-100/70">
              Buying TOS on Base is not a subscription and currently has near-zero liquidity.
              Do not market it as income. {notes.join(" ")}
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}