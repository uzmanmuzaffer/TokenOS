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

function normalizeItem(item, fallbackStatus) {
  const status =
    item?.status ||
    (item?.received?.detected ? "received" : fallbackStatus);

  const usd =
    Number(
      item?.received?.usdValue ??
        item?.usdValue ??
        item?.valuation?.usdValue ??
        0
    );

  return {
    id:
      item?.id ||
      item?.project ||
      item?.token?.symbol ||
      item?.symbol ||
      Math.random().toString(16).slice(2),
    project: item?.project || item?.name || item?.token?.name || "Unknown",
    symbol: item?.token?.symbol || item?.symbol || "UNKNOWN",
    status,
    usd,
    amount: item?.received?.amount ?? item?.amount ?? null,
    eligibility:
      item?.eligibility?.type ||
      item?.eligibility ||
      item?.reason ||
      "No extra eligibility note",
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
          <h2 className="truncate text-lg font-bold text-white">
            {airdrop.project}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Token: {airdrop.symbol}</p>
        </div>
        <StatusBadge status={airdrop.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Value
          </p>
          <p className="mt-1 text-lg font-bold text-cyan-400">
            {formatUsd(airdrop.usd)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Evidence
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {airdrop.evidenceCount} tx
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        {airdrop.eligibility}
      </p>

      {airdrop.claimUrl ? (
        <a
          href={airdrop.claimUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-lg border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
        >
          Open claim page
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

  const received = useMemo(() => {
    const rows = Array.isArray(scan?.received?.results)
      ? scan.received.results
      : [];
    return rows.map((item) => normalizeItem(item, "received"));
  }, [scan]);

  const others = useMemo(() => {
    const rows = Array.isArray(scan?.results) ? scan.results : [];
    return rows
      .filter((item) => item?.status !== "received")
      .map((item) => normalizeItem(item, "potential"));
  }, [scan]);

  const stats = {
    received: received.length,
    claimable: others.filter((i) => i.status === "claimable").length,
    potential: others.filter((i) => i.status !== "claimable").length,
    value:
      Number(scan?.summary?.receivedUsd || 0) +
      Number(scan?.summary?.confirmedTotalUsd || 0),
  };

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
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Wallet scan
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Airdrop Radar</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Paste any EVM wallet to see tokens already received and known
              eligibility signals. This cannot predict unpublished airdrops.
            </p>
          </header>

          <form
            onSubmit={handleScan}
            className="mb-6 flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
          >
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
            <Stat label="Received" value={stats.received} />
            <Stat label="Claimable" value={stats.claimable} />
            <Stat label="Potential" value={stats.potential} />
            <Stat label="Est. value" value={formatUsd(stats.value)} accent />
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">
              Scanning this wallet against known airdrop sources...
            </div>
          )}

          {!loading && !scan && !error && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
              <p className="text-lg font-medium">No wallet scanned yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Paste an address to list received airdrops and eligibility hits.
              </p>
            </div>
          )}

          {!loading && scan && (
            <div className="space-y-8">
              <section>
                <h2 className="mb-4 text-lg font-semibold">Received</h2>
                {received.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No confirmed airdrop transfers found for this wallet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {received.map((item) => (
                      <AirdropCard key={`r-${item.id}`} airdrop={item} />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">
                  Eligibility signals
                </h2>
                {others.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No extra campaign match from the current database.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {others.map((item) => (
                      <AirdropCard key={`o-${item.id}`} airdrop={item} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-2 truncate text-2xl font-bold ${
          accent ? "text-cyan-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}