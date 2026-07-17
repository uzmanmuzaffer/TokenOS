import React from "react";
import {
  Wallet,
  TrendingUp,
  Coins,
  ShieldAlert,
  Trophy,
  Network,
} from "lucide-react";

const cards = [
  {
    title: "Portfolio Value",
    value: "$24,560.38",
    icon: <Wallet size={24} />,
    color: "bg-blue-500",
  },
  {
    title: "24h Change",
    value: "+5.42%",
    icon: <TrendingUp size={24} />,
    color: "bg-green-500",
  },
  {
    title: "Token Count",
    value: "38",
    icon: <Coins size={24} />,
    color: "bg-purple-500",
  },
  {
    title: "Risk Score",
    value: "Low",
    icon: <ShieldAlert size={24} />,
    color: "bg-red-500",
  },
  {
    title: "Largest Holding",
    value: "ETH",
    icon: <Trophy size={24} />,
    color: "bg-yellow-500",
  },
  {
    title: "Network",
    value: "Base",
    icon: <Network size={24} />,
    color: "bg-cyan-500",
  },
];

export default function PortfolioOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-slate-900 rounded-xl p-5 border border-slate-700 hover:border-blue-500 transition"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">{card.title}</p>

              <h2 className="text-2xl font-bold mt-2">
                {card.value}
              </h2>
            </div>

            <div
              className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}