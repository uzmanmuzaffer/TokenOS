import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { billingApi, setBillingAccount } from "../services/billingApi.js";

export default function Billing() {
  const [email, setEmail] = useState(
    () => window.localStorage.getItem("tokenos_account") || ""
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [freshKey, setFreshKey] = useState("");

  async function load() {
    setError("");
    try {
      if (email) setBillingAccount(email);
      setData(await billingApi.account());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function makeKey() {
    try {
      const created = await billingApi.createApiKey("desk");
      setFreshKey(created.token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const usage = data?.account?.usage;
  const plan = data?.plan;
  const referral = data?.referral;

  return (
    <div className="flex min-h-screen bg-[#070b14] text-white">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-3xl font-semibold">Billing desk</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Quotas, plan, API keys and referral commission.
        </p>

        <div className="mt-6 flex max-w-xl gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="account email"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
          <button
            onClick={load}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Sync
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card title="Current plan" value={plan?.name || "Explorer"} hint={`$${plan?.priceUsd || 0}/mo`} />
          <Card title="Scans today" value={`${usage?.scans ?? 0}/${plan?.limits?.scansPerDay ?? 8}`} />
          <Card title="Referral earned" value={`$${referral?.earnedUsd ?? 0}`} hint={referral?.code ? `Code ${referral.code}` : ""} />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold">Referral link</h2>
          <code className="mt-4 block overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-sm text-cyan-300">
            {`http://localhost:5173/pricing?ref=${referral?.code || "yourcode"}`}
          </code>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">API keys</h2>
            <button
              onClick={makeKey}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-cyan-500"
            >
              Create key
            </button>
          </div>
          {freshKey ? (
            <p className="mt-4 break-all rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              New key: {freshKey}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {(data?.apiKeys || []).map((key) => (
              <li key={key.id} className="rounded-lg border border-slate-800 px-3 py-2">
                {key.prefix}… · {key.label}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Card({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}