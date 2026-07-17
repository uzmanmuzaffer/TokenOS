import { useEffect } from "react";
import useMarketStore from "../../store/marketStore";

export default function TrendingTokens() {
  const {
    tokens,
    loading,
    error,
    fetchTokens,
  } = useMarketStore();

  useEffect(() => {
    if (tokens.length === 0) {
      fetchTokens();
    }
  }, [tokens.length, fetchTokens]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        Loading trending tokens...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 rounded-2xl p-6">
        {error}
      </div>
    );
  }

  const trending = tokens.slice(0, 5);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">
        🔥 Trending Tokens
      </h2>

      <div className="space-y-3">
        {trending.map((token, index) => (
          <div
            key={token.id || token.symbol || index}
            className="flex items-center justify-between bg-slate-950 rounded-xl p-4 border border-slate-800"
          >
            <div>
              <div className="font-semibold">
                {token.name}
              </div>

              <div className="text-sm text-slate-400">
                {token.symbol}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-cyan-400">
                $
                {token.price ??
                  token.current_price ??
                  "-"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}