import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { scanWalletAirdrops } from "../services/api";
import useWalletStore from "../store/walletStore";

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function StatusBadge({ status }) {
  const normalized = String(status || "potential").toLowerCase();
  const styles = {
    received: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    already_received: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    claimable: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    likely: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    potential: "bg-slate-500/10 border-slate-500/30 text-slate-300",
    expired: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${
        styles[normalized] || styles.potential
      }`}
    >
      {normalized.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}

function pickList(scan) {
  if (!scan || typeof scan !== "object") return [];
  if (Array.isArray(scan.results)) return scan.results;
  if (Array.isArray(scan.airdrops)) return scan.airdrops;
  if (Array.isArray(scan.data?.results)) return scan.data.results;
  if (Array.isArray(scan.received?.results)) return scan.received.results;
  return [];
}

function normalizeItem(item) {
  const status = String(
    item?.status ||
      (item?.received?.detected ? "received" : "potential")
  ).toLowerCase();

  return {
    id: item?.id || item?.project || item?.token?.symbol || Math.random().toString(16),
    project: item?.project || item?.name || item?.token?.name || "Unknown",
    symbol: item?.token?.symbol || item?.symbol || "UNKNOWN",
    status,
    usd: Number(
      item?.received?.usdValue ??
        item?.usdValue ??
        item?.valuation?.usdValue ??
        0
    ),
    eligibility:
      (Array.isArray(item?.eligibility?.reasons) &&
        item.eligibility.reasons.join(" ")) ||
      item?.eligibility?.type ||
      item?.eligibility ||
      "No extra note",
    claimUrl: item?.claim?.url || item?.url || "",
    evidenceCount:
      item?.received?.transfers?.length ||
      item?.evidence?.transactionCount ||
      0,
  };
}

function AirdropCard({ airdrop }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white">{airdrop.project}</h2>
          <p className="mt-1 text-xs text-slate-500">Token: {airdrop.symbol}</p>
        </div>
        <StatusBadge status={airdrop.status} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Value</p>
          <p className="mt-1 text-lg font-bold text-cyan-400">{formatUsd(airdrop.usd)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Evidence</p>
          <p className="mt-1 text-lg font-bold text-white">{airdrop.evidenceCount} tx</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{airdrop.eligibility}</p>
      {airdrop.claimUrl ? (
        <a
          href={airdrop.claimUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-lg border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
        >
          Open page
        </a>
      ) : null}
    </article>
  );
}

export default function AirdropRadar() {
  const storeWallet = useWalletStore((s) => s.wallet);
  const [wallet, setWallet] = useState(storeWallet || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scan, setScan] = useState(null);

  const items = useMemo(
    () => pickList(scan).map(normalizeItem),
    [scan]
  );

  const received = items.filter((i) =>
    ["received", "already_received"].includes(i.status)
  );
  const claimable = items.filter((i) => i.status === "claimable");
  const potential = items.filter(
    (i) => !["received", "already_received", "claimable"].includes(i.status)
  );

  async function handleScan(e) {
    e?.preventDefault?.();
    const value = wallet.trim();
    if (!value) return;

    setLoading(true);
    setError("");

    try {
      const result = await scanWalletAirdrops(value);
      if (!result?.success) {
        throw new Error(result?.error || "Wallet airdrop scan failed.");
      }
      setScan(result);
    } catch (err) {
      setScan(null);
      setError(err.message || "Wallet airdrop scan failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Wallet scan</p>
            <h1 className="mt-1 text-2xl font-semibold">Airdrop Radar</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Paste any EVM wallet. Received = tokens that already arrived.
              Potential = known campaigns, not a guaranteed win.
            </p>
          </header>

          <form onSubmit={handleScan} className="mb-6 flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="Paste wallet address (0x...)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !wallet.trim()}
              className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan wallet"}
            </button>
          </form>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Received" value={received.length} />
            <Stat label="Claimable" value={claimable.length} />
            <Stat label="Potential" value={potential.length} />
            <Stat
              label="Est. value"
              value={formatUsd(scan?.summary?.totalKnownUsd || scan?.summary?.receivedUsd || 0)}
              accent
            />
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">
              Scanning this wallet...
            </div>
          )}

          {!loading && !scan && !error && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
              <p className="text-lg font-medium">No wallet scanned yet</p>
            </div>
          )}

          {!loading && scan && (
            <div className="space-y-8">
              <Block title="Received" empty="No confirmed airdrop transfers on scanned chains." items={received} />
              <Block title="Claimable" empty="No live claimable allocation found." items={claimable} />
              <Block title="Potential campaigns" empty="No campaign records returned." items={potential} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Block({ title, empty, items }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <AirdropCard key={item.id} airdrop={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 truncate text-2xl font-bold ${accent ? "text-cyan-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}