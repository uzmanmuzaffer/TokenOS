
import { useEffect, useState } from "react";
import {
  FaCoins,
  FaDatabase,
  FaWallet,
  FaChartLine,
  FaCheckCircle,
  FaCopy,
  FaExternalLinkAlt,
} from "react-icons/fa";

import { getTokenInfo } from "../services/tokenService";
import { getTokens } from "../services/api";

function StatsCards() {
  const [tokenInfo, setTokenInfo] = useState(null);

  const [market, setMarket] = useState({
    priceUsd: 0,
    liquidity: 0,
    marketCap: 0,
    volume24h: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // ==========================
        // TOKEN INFO
        // ==========================

        const token = await getTokenInfo();

        if (mounted) {
          setTokenInfo(token);
        }

        // ==========================
        // MARKET DATA
        // Backend: /api/tokens
        // ==========================

        const tokens = await getTokens();

        if (!mounted || !Array.isArray(tokens)) {
          return;
        }

        /*
         * /api/tokens currently returns the most active
         * Base/Aerodrome tokens.
         *
         * We first try to find TOS by symbol/address.
         * If TOS is not present, we keep the existing
         * market values instead of displaying unrelated
         * token data.
         */

        const contract =
          token?.contract?.toLowerCase?.() || "";

        const tos = tokens.find((item) => {
          const symbol =
            String(item?.symbol || "").toLowerCase();

          const address =
            String(item?.address || "").toLowerCase();

          return (
            symbol === "tos" ||
            address === contract
          );
        });

        if (tos) {
          const price =
            Number(
              String(tos.price || "")
                .replace("$", "")
                .replace(/,/g, "")
            ) || 0;

          const liquidity =
            Number(tos.liquidity || 0);

          const volume24h =
            Number(tos.volume || 0);

          /*
           * Market cap may not be supplied by the
           * current /api/tokens endpoint.
           *
           * If it is available in the future, use it.
           * Otherwise calculate it from total supply.
           */

          const suppliedMarketCap =
            Number(
              tos.marketCap ||
                tos.fdv ||
                0
            );

          const totalSupply =
            Number(token?.totalSupply || 0);

          const calculatedMarketCap =
            suppliedMarketCap > 0
              ? suppliedMarketCap
              : price > 0 && totalSupply > 0
              ? price * totalSupply
              : 0;

          setMarket({
            priceUsd: price,
            liquidity,
            marketCap: calculatedMarketCap,
            volume24h,
          });

          return;
        }

        /*
         * TOS is not currently in the 10-token market
         * response. Do not incorrectly display SOL,
         * AERO, VVV, etc. as TokenOS.
         *
         * Keep the previous market source as fallback.
         */

        console.log(
          "TOS not found in /api/tokens response."
        );
      } catch (error) {
        console.error(
          "Stats error:",
          error
        );
      }
    }

    load();

    const timer = setInterval(
      load,
      30000
    );

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const safeSupply =
    Number(
      tokenInfo?.totalSupply || 0
    );

  const stats = [
    {
      title: "Token",
      value:
        tokenInfo?.name ||
        "TokenOS",
      change:
        tokenInfo?.symbol ||
        "TOS",
      icon: <FaCoins />,
      color:
        "text-cyan-400",
    },

    {
      title: "Price",
      value:
        market.priceUsd > 0
          ? `$${market.priceUsd.toFixed(6)}`
          : "Not Indexed",
      change:
        market.priceUsd > 0
          ? "Live"
          : "Waiting",
      icon:
        <FaChartLine />,
      color:
        "text-green-400",
    },

    {
      title: "Liquidity",
      value:
        market.liquidity > 0
          ? `$${market.liquidity.toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 2,
              }
            )}`
          : "Not Indexed",
      change:
        market.liquidity > 0
          ? "DEX"
          : "Waiting",
      icon:
        <FaWallet />,
      color:
        "text-orange-400",
    },

    {
      title: "Market Cap",
      value:
        market.marketCap > 0
          ? `$${market.marketCap.toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 2,
              }
            )}`
          : "Not Indexed",
      change:
        market.marketCap > 0
          ? "Live"
          : "Waiting",
      icon:
        <FaDatabase />,
      color:
        "text-purple-400",
    },

    {
      title: "Total Supply",
      value:
        safeSupply > 0
          ? safeSupply.toLocaleString(
              "en-US"
            )
          : "0",
      change:
        tokenInfo?.symbol ||
        "TOS",
      icon:
        <FaCoins />,
      color:
        "text-cyan-400",
    },

    {
      title: "24H Volume",
      value:
        market.volume24h > 0
          ? `$${market.volume24h.toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 2,
              }
            )}`
          : "$0",
      change:
        market.volume24h > 0
          ? "Volume"
          : "Waiting",
      icon:
        <FaChartLine />,
      color:
        "text-blue-400",
    },

    {
      title: "Network",
      value: "Base",
      change: "Mainnet",
      icon:
        <FaDatabase />,
      color:
        "text-green-400",
    },

    {
      title: "Contract Address",
      value:
        tokenInfo?.contract
          ? `${tokenInfo.contract.slice(
              0,
              6
            )}...${tokenInfo.contract.slice(
              -4
            )}`
          : "-",
      change: "Verified",
      icon:
        <FaCheckCircle />,
      color:
        "text-yellow-400",
      contract:
        tokenInfo?.contract,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">
                {item.title}
              </p>

              <h3 className="text-xl font-bold text-white mt-2 break-all">
                {item.value}
              </h3>

              <p className="text-sm text-cyan-400 mt-1">
                {item.change}
              </p>
            </div>

            <div
              className={`text-2xl ${item.color} bg-slate-800 p-3 rounded-xl`}
            >
              {item.icon}
            </div>
          </div>

          {item.contract && (
            <div className="flex gap-2 mt-5">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    item.contract
                  )
                }
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-sm"
              >
                <FaCopy />
                Copy
              </button>

              <a
                href={`https://basescan.org/token/${item.contract}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
              >
                <FaExternalLinkAlt />
                BaseScan
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StatsCards;

