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
import { getTokenMarket } from "../services/dexscreener";

function StatsCards() {
  const [tokenInfo, setTokenInfo] = useState(null);

  const [market, setMarket] = useState({
    priceUsd: 0,
    liquidity: 0,
    marketCap: 0,
    volume24h: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const token = await getTokenInfo();
        setTokenInfo(token);

        try {
          const marketData = await getTokenMarket();

          if (marketData) {
            setMarket({
              priceUsd: Number(marketData.priceUsd || 0),
              liquidity: Number(marketData.liquidity || 0),
              marketCap: Number(marketData.marketCap || 0),
              volume24h: Number(marketData.volume24h || 0),
            });
          }
        } catch {
          console.log("Market data unavailable");
        }
      } catch (error) {
        console.error("Stats error:", error);
      }
    }

    load();

    const timer = setInterval(load, 30000);

    return () => clearInterval(timer);
  }, []);

  const safeSupply = Number(tokenInfo?.totalSupply || 0);

  const stats = [
    {
      title: "Token",
      value: tokenInfo?.name || "TokenOS",
      change: tokenInfo?.symbol || "TOS",
      icon: <FaCoins />,
      color: "text-cyan-400",
    },

    {
      title: "Price",
      value:
        market.priceUsd > 0
          ? `$${market.priceUsd.toFixed(6)}`
          : "Not Indexed",
      change: "Live",
      icon: <FaChartLine />,
      color: "text-green-400",
    },

    {
      title: "Liquidity",
      value:
        market.liquidity > 0
          ? `$${market.liquidity.toLocaleString("tr-TR")}`
          : "Not Indexed",
      change: "DEX",
      icon: <FaWallet />,
      color: "text-orange-400",
    },

    {
      title: "Market Cap",
      value:
        market.marketCap > 0
          ? `$${market.marketCap.toLocaleString("tr-TR")}`
          : "Not Indexed",
      change: "Live",
      icon: <FaDatabase />,
      color: "text-purple-400",
    },

    {
      title: "Total Supply",
      value:
        safeSupply > 0
          ? safeSupply.toLocaleString("tr-TR")
          : "0",
      change: "TOS",
      icon: <FaCoins />,
      color: "text-cyan-400",
    },

    {
      title: "24H Volume",
      value:
        market.volume24h > 0
          ? `$${market.volume24h.toLocaleString("tr-TR")}`
          : "$0",
      change: "Volume",
      icon: <FaChartLine />,
      color: "text-blue-400",
    },

    {
      title: "Network",
      value: "Base",
      change: "Mainnet",
      icon: <FaDatabase />,
      color: "text-green-400",
    },

    {
      title: "Contract Address",
      value: tokenInfo?.contract
        ? `${tokenInfo.contract.slice(0, 6)}...${tokenInfo.contract.slice(-4)}`
        : "-",
      change: "Verified",
      icon: <FaCheckCircle />,
      color: "text-yellow-400",
      contract: tokenInfo?.contract,
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
              <p className="text-gray-400 text-sm">{item.title}</p>

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
                  navigator.clipboard.writeText(item.contract)
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