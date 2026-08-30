
import { useEffect, useMemo, useState } from "react";
import { getAirdropOpportunities } from "../services/api";

function formatUsd(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(number);
}

function StatusBadge({ status }) {
  const normalized = String(status || "potential").toLowerCase();

  const styles = {
    claimable:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    eligible_unpriced:
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    likely:
      "bg-blue-500/10 border-blue-500/30 text-blue-400",
    potential:
      "bg-slate-500/10 border-slate-500/30 text-slate-300",
    received:
      "bg-purple-500/10 border-purple-500/30 text-purple-400",
    expired:
      "bg-red-500/10 border-red-500/30 text-red-400",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${
        styles[normalized] || styles.potential
      }`}
    >
      {normalized.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}

function AirdropCard({ airdrop }) {
  const project =
    airdrop?.project || "Unknown Project";

  const symbol =
    airdrop?.token?.symbol || "UNKNOWN";

  const valuation =
    Number(airdrop?.valuation?.usdValue || 0);

  const eligibility =
    airdrop?.eligibility?.type ||
    "Eligibility signal unavailable";

  const chains = Array.isArray(airdrop?.chains)
    ? airdrop.chains
    : [];

  const claimUrl =
    airdrop?.claim?.url ||
    airdrop?.url ||
    "";

  const verified =
    airdrop?.verified === true;

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10 transition duration-200 hover:border-cyan-500/40 hover:bg-slate-900">
      {/* Header */}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-lg font-black text-cyan-400">
              {project.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-white">
                {project}
              </h2>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                Token: {symbol}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={airdrop?.status} />
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid min-w-0 grid-cols-2 gap-3">
        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Potential Value
          </p>

          <p className="mt-1 truncate text-lg font-bold text-cyan-400">
            {formatUsd(valuation)}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Verification
          </p>

          <p
            className={`mt-1 truncate text-sm font-bold ${
              verified
                ? "text-emerald-400"
                : "text-slate-400"
            }`}
          >
            {verified ? "VERIFIED" : "UNVERIFIED"}
          </p>
        </div>
      </div>

      {/* Eligibility */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Eligibility
        </p>

        <p className="mt-1 break-words text-sm text-slate-300">
          {eligibility}
        </p>
      </div>

      {/* Chains */}
      {chains.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Networks
          </p>

          <div className="flex flex-wrap gap-2">
            {chains.map((chain, index) => (
              <span
                key={`${chain}-${index}`}
                className="max-w-full rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300"
              >
                {String(chain)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-xs text-slate-500">
          Source: DeFiLlama
        </span>

        {claimUrl ? (
          <a
            href={claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Open Claim ↗
          </a>
        ) : (
          <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-500">
            No Claim Link
          </span>
        )}
      </div>
    </article>
  );
}

function AirdropRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAirdrops() {
    setLoading(true);
    setError("");

    try {
      const result =
        await getAirdropOpportunities();

      if (!result?.success) {
        throw new Error(
          result?.error ||
            "Airdrop Radar data could not be loaded."
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Airdrop Radar Error:",
        err
      );

      setError(
        err?.message ||
          "Airdrop Radar could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAirdrops();
  }, []);

  const opportunities =
    Array.isArray(data?.airdrops)
      ? data.airdrops
      : [];

  const stats = useMemo(() => {
    const claimable =
      opportunities.filter(
        (item) =>
          item?.status === "claimable" ||
          item?.claim?.isLive === true
      ).length;

    const potential =
      opportunities.filter(
        (item) =>
          item?.status === "potential" ||
          item?.status === "likely" ||
          item?.status === "eligible_unpriced"
      ).length;

    const verified =
      opportunities.filter(
        (item) =>
          item?.verified === true
      ).length;

    const potentialValue =
      opportunities.reduce(
        (sum, item) =>
          sum +
          Number(
            item?.valuation?.usdValue || 0
          ),
        0
      );

    return {
      total: opportunities.length,
      claimable,
      potential,
      verified,
      potentialValue,
    };
  }, [opportunities]);

  return (
    <section className="w-full min-w-0 overflow-x-hidden">
      <div className="w-full min-w-0">
        {/* Header */}
        <header className="mb-6 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Airdrop Radar
              </h1>

              <span className="inline-flex shrink-0 items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-cyan-400">
                LIVE DISCOVERY
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Discover airdrop opportunities,
              eligibility signals and claim
              information.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAirdrops}
            disabled={loading}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading
              ? "Scanning..."
              : "Refresh Radar"}
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Opportunities
            </p>

            <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              {stats.total}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900 p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Claimable
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400 sm:text-3xl">
              {stats.claimable}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900 p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Potential
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-400 sm:text-3xl">
              {stats.potential}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900 p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Potential Value
            </p>

            <p className="mt-2 truncate text-xl font-bold text-cyan-400 sm:text-2xl">
              {formatUsd(stats.potentialValue)}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

            <p className="text-sm font-semibold text-cyan-400">
              Scanning Airdrop Radar...
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Discovering the latest opportunities.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          opportunities.length === 0 &&
          !error && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-sm text-slate-300">
                No airdrop opportunities
                discovered yet.
              </p>

              <button
                type="button"
                onClick={loadAirdrops}
                className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                Scan Again
              </button>
            </div>
          )}

        {/* Cards */}
        {!loading &&
          opportunities.length > 0 && (
            <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-2">
              {opportunities.map(
                (airdrop, index) => (
                  <AirdropCard
                    key={
                      airdrop?.id ||
                      `${airdrop?.project || "airdrop"}-${index}`
                    }
                    airdrop={airdrop}
                  />
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}

export default AirdropRadar;

