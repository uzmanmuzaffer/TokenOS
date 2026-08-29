
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
  const styles = {
    claimable:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    eligible_unpriced:
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    likely:
      "bg-blue-500/10 border-blue-500/30 text-blue-400",
    potential:
      "bg-slate-500/10 border-slate-500/30 text-slate-400",
    expired:
      "bg-red-500/10 border-red-500/30 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-semibold ${
        styles[status] ||
        styles.potential
      }`}
    >
      {String(status || "potential").replaceAll("_", " ").toUpperCase()}
    </span>
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
            "Airdrop Radar verisi alınamadı."
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Airdrop Radar Error:",
        err
      );

      setError(
        err.message ||
          "Airdrop Radar yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAirdrops();
  }, []);

  const opportunities =
    data?.airdrops || [];

  const stats = useMemo(() => {
    const claimable =
      opportunities.filter(
        (item) =>
          item.status ===
            "claimable" ||
          item.claim?.isLive === true
      );

    const potential =
      opportunities.filter(
        (item) =>
          item.status ===
            "potential" ||
          item.status === "likely"
      );

    const verified =
      opportunities.filter(
        (item) =>
          item.verified === true
      );

    const potentialValue =
      potential.reduce(
        (sum, item) =>
          sum +
          Number(
            item.valuation?.usdValue ||
              0
          ),
        0
      );

    return {
      total: opportunities.length,
      claimable: claimable.length,
      potential: potential.length,
      verified: verified.length,
      potentialValue,
    };
  }, [opportunities]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">
                Airdrop Radar
              </h1>

              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                LIVE DISCOVERY
              </span>
            </div>

            <p className="text-slate-400 mt-2">
              Discover airdrop opportunities,
              eligibility signals and claim
              information.
            </p>
          </div>

          <button
            onClick={loadAirdrops}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition"
          >
            {loading
              ? "Scanning..."
              : "Refresh Radar"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Opportunities
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Claimable
            </p>

            <p className="text-3xl font-bold mt-2 text-emerald-400">
              {stats.claimable}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Potential
            </p>

            <p className="text-3xl font-bold mt-2 text-blue-400">
              {stats.potential}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Potential Value
            </p>

            <p className="text-3xl font-bold mt-2 text-cyan-400">
              {formatUsd(
                stats.potentialValue
              )}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-cyan-400 text-lg font-semibold">
              Scanning Airdrop Radar...
            </div>

            <p className="text-slate-500 mt-2">
              Discovering the latest
              opportunities.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          opportunities.length === 0 &&
          !error && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-slate-300">
                No airdrop opportunities
                discovered yet.
              </p>
            </div>
          )}

        {/* Cards */}
        {!loading &&
          opportunities.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {opportunities.map(
                (airdrop) => (
                  <div
                    key={airdrop.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">
                          {airdrop.project ||
                            "Unknown Project"}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          Token:{" "}
                          {airdrop.token
                            ?.symbol ||
                            "UNKNOWN"}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          airdrop.status
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="rounded-xl bg-slate-950 p-4">
                        <p className="text-xs text-slate-500">
                          Valuation
                        </p>

                        <p className="text-lg font-semibold mt-1">
                          {formatUsd(
                            airdrop
                              .valuation
                              ?.usdValue
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-950 p-4">
                        <p className="text-xs text-slate-500">
                          Verified
                        </p>

                        <p className="text-lg font-semibold mt-1">
                          {airdrop.verified
                            ? "YES"
                            : "UNVERIFIED"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs text-slate-500 mb-2">
                        Eligibility
                      </p>

                      <p className="text-sm text-slate-300">
                        {airdrop
                          .eligibility
                          ?.type ||
                          "Unknown"}
                      </p>
                    </div>

                    {Array.isArray(
                      airdrop.chains
                    ) &&
                      airdrop.chains
                        .length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {airdrop.chains.map(
                            (chain) => (
                              <span
                                key={chain}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-300"
                              >
                                {chain}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-800">
                      <span className="text-xs text-slate-500">
                        Source: DeFiLlama
                      </span>

                      {airdrop.claim
                        ?.url && (
                        <a
                          href={
                            airdrop.claim
                              .url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition"
                        >
                          Open Claim
                        </a>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </main>
    </div>
  );
}

export default AirdropRadar;

