import { useEffect, useState } from "react";
import {
  FaCoins,
  FaDatabase,
  FaWallet,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";

import { getTokenInfo } from "../services/tokenService";
import { getTokenMarket } from "../services/dexscreener";

function StatsCards() {
  const [tokenInfo, setTokenInfo] = useState({
    address: "",
    name: "Loading...",
    symbol: "...",
    totalSupply: "0",
  });

  const [market, setMarket] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getTokenInfo();
        setTokenInfo(token);

        const marketData = await getTokenMarket();
        setMarket(marketData);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();

    // 30 saniyede bir fiyat güncelle
    const interval = setInterval(async () => {
      try {
        const marketData = await getTokenMarket();
        setMarket(marketData);
      } catch (err) {
        console.error(err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Token",
      value: tokenInfo.name,
      change: tokenInfo.symbol,
      icon: <FaCoins />,
      color: "text-cyan-400",
    },
    {
      title: "Price",
      value:
        market && market.priceUsd > 0
          ? `$${market.priceUsd.toFixed(6)}`
          : "Not Indexed",
      change: "Live",
      icon: <FaChartLine />,
      color: "text-green-400",
    },
    {
      title: "Liquidity",
      value:
        market && market.liquidity > 0
          ? `$${market.liquidity.toLocaleString("tr-TR")}`
          : "Not Indexed",
      change: "DEX",
      icon: <FaWallet />,
      color: "text-orange-400",
    },
    {
      title: "Market Cap",
      value:
        market && market.marketCap > 0
          ? `$${market.marketCap.toLocaleString("tr-TR")}`
          : "Not Indexed",
      change: "Live",
      icon: <FaDatabase />,
      color: "text-purple-400",
    },
    {
      title: "Total Supply",
      value: Number(tokenInfo.totalSupply).toLocaleString("tr-TR"),
      change: "TOS",
      icon: <FaDatabase />,
      color: "text-cyan-400",
    },
    {
      title: "24H Volume",
      value:
        market
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
      icon: <FaWallet />,
      color: "text-green-400",
    },
    {
      title: "Contract",
      value: "Verified",
      change: "BaseScan",
      icon: <FaCheckCircle />,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => (
        <div
          key={item.title}
          className="
            bg-slate-900/80
            border border-slate-800
            rounded-2xl
            p-6
            hover:border-cyan-500/40
            transition-all
            duration-300
            hover:-translate-y-1
          "
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-white mt-3 break-all">
                {item.value}
              </h2>

              <p className="text-sm text-green-400 mt-2">
                {item.change}
              </p>
            </div>

            <div
              className={`
                text-3xl
                ${item.color}
                bg-slate-800
                p-3
                rounded-xl
              `}
            >
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;