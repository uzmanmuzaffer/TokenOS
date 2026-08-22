import { useCallback, useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatNumber(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000_000) {
    return `$${(number / 1_000_000_000).toFixed(2)}B`;
  }

  if (number >= 1_000_000) {
    return `$${(number / 1_000_000).toFixed(2)}M`;
  }

  if (number >= 1_000) {
    return `$${(number / 1_000).toFixed(1)}K`;
  }

  return `$${number.toFixed(2)}`;
}

function formatPrice(value) {
  const number = Number(value || 0);

  if (number >= 1) {
    return `$${number.toLocaleString("en-US", {
      maximumFractionDigits: 4,
    })}`;
  }

  if (number >= 0.01) {
    return `$${number.toFixed(4)}`;
  }

  if (number >= 0.0001) {
    return `$${number.toFixed(6)}`;
  }

  return `$${number.toFixed(8)}`;
}

function formatChange(value) {
  const number = Number(value || 0);

  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function getScore(token) {
  const volume = Number(token.volume24h || 0);
  const liquidity = Number(token.liquidity || 0);
  const change = Number(token.change24h || 0);

  let score = 0;

  if (volume >= 10_000_000) score += 40;
  else if (volume >= 1_000_000) score += 32;
  else if (volume >= 500_000) score += 25;
  else if (volume >= 100_000) score += 15;

  if (liquidity >= 500_000) score += 30;
  else if (liquidity >= 100_000) score += 25;
  else if (liquidity >= 50_000) score += 18;

  if (change >= 100) score += 30;
  else if (change >= 50) score += 25;
  else if (change >= 20) score += 18;
  else if (change > 0) score += 10;

  return Math.min(score, 100);
}

function getSignal(token) {
  const score = getScore(token);
  const change = Number(token.change24h || 0);

  if (score >= 75) {
    return {
      label: "HOT",
      className: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    };
  }

  if (score >= 50) {
    return {
      label: "RISING",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    };
  }

  if (change < 0) {
    return {
      label: "WATCH",
      className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    };
  }

  return {
    label: "WATCH",
    className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };
}

function BaseRadar() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchRadar = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/radar`);

      if (!response.ok) {
        throw new Error("Base Radar API bağlantısı başarısız.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Radar verisi alınamadı.");
      }

      setTokens(Array.isArray(data.tokens) ? data.tokens : []);
      setUpdatedAt(data.updatedAt || null);
    } catch (err) {
      console.error("Base Radar:", err);
      setError(err.message || "Radar verisi alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRadar();

    const interval = setInterval(() => {
      fetchRadar();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchRadar]);

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>

            <h2 className="text-2xl font-bold text-white">
              Base Radar
            </h2>

            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
              BASE
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Base ağındaki hareketli tokenleri canlı piyasa verileriyle keşfet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="text-xs text-slate-500">
              Güncellendi:{" "}
              {new Date(updatedAt).toLocaleTimeString("tr-TR")}
            </span>
          )}

          <button
            onClick={fetchRadar}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "↻ Yenile"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && tokens.length === 0 && (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />

          <p className="text-sm text-slate-400">
            Base Radar taranıyor...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="font-medium text-red-300">
            Radar bağlantı hatası
          </p>

          <p className="mt-1 text-sm text-red-400/80">
            {error}
          </p>

          <button
            onClick={fetchRadar}
            className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tokens.length === 0 && (
        <div className="p-8 text-center text-slate-400">
          Base Radar şu anda token bulamadı.
        </div>
      )}

      {/* Desktop Table */}
      {tokens.length > 0 && (
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Token</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">24H</th>
                <th className="px-4 py-4">Volume</th>
                <th className="px-4 py-4">Liquidity</th>
                <th className="px-4 py-4">Market Cap</th>
                <th className="px-4 py-4">Score</th>
                <th className="px-6 py-4">Signal</th>
              </tr>
            </thead>

            <tbody>
              {tokens.map((token, index) => {
                const score = getScore(token);
                const signal = getSignal(token);
                const positive = Number(token.change24h || 0) >= 0;

                return (
                  <tr
                    key={`${token.address}-${index}`}
                    className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">
                          {index + 1}
                        </div>

                        <div>
                          <div className="font-semibold text-white">
                            {token.name || token.symbol}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {token.symbol}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-200">
                      {formatPrice(token.price)}
                    </td>

                    <td
                      className={`px-4 py-4 font-semibold ${
                        positive
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatChange(token.change24h)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatNumber(token.volume24h)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatNumber(token.liquidity)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatNumber(token.marketCap)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        <span className="text-xs font-semibold text-slate-300">
                          {score}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${signal.className}`}
                        >
                          {signal.label}
                        </span>

                        {token.url && (
                          <a
                            href={token.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-500 transition hover:text-blue-400"
                            title="DexScreener'da aç"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {tokens.length > 0 && (
        <div className="space-y-3 p-4 lg:hidden">
          {tokens.map((token, index) => {
            const score = getScore(token);
            const signal = getSignal(token);
            const positive = Number(token.change24h || 0) >= 0;

            return (
              <div
                key={`${token.address}-mobile-${index}`}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {token.name || token.symbol}
                      </p>

                      <p className="text-xs text-slate-500">
                        {token.symbol}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-semibold ${signal.className}`}
                  >
                    {signal.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="mt-1 font-medium text-slate-200">
                      {formatPrice(token.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">24H</p>
                    <p
                      className={`mt-1 font-semibold ${
                        positive
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatChange(token.change24h)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Volume</p>
                    <p className="mt-1 text-slate-300">
                      {formatNumber(token.volume24h)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Liquidity</p>
                    <p className="mt-1 text-slate-300">
                      {formatNumber(token.liquidity)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Market Cap</p>
                    <p className="mt-1 text-slate-300">
                      {formatNumber(token.marketCap)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Radar Score</p>
                    <p className="mt-1 font-semibold text-blue-300">
                      {score}/100
                    </p>
                  </div>
                </div>

                {token.url && (
                  <a
                    href={token.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-center text-xs font-medium text-slate-300 transition hover:border-blue-500/30 hover:text-blue-300"
                  >
                    DexScreener'da Gör ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {tokens.length > 0 && (
        <div className="border-t border-slate-800 px-6 py-4">
          <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {tokens.length} Base tokeni tarandı
            </span>

            <span>
              Veriler DexScreener üzerinden alınmaktadır.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default BaseRadar;