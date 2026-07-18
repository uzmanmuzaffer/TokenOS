import {
  Wallet,
  Coins,
  Trophy,
  Network,
} from "lucide-react";

import useWalletStore from "../../store/walletStore";

export default function PortfolioOverview() {
  const { data } = useWalletStore();

  const portfolio = data?.portfolio;

  const cards = [
    {
      title: "Analyzed Chains",
      value: portfolio?.totalChains ?? "-",
      icon: <Network size={24} />,
      color: "bg-cyan-500",
    },
    {
      title: "Total Tokens",
      value: portfolio?.totalTokens ?? "-",
      icon: <Coins size={24} />,
      color: "bg-purple-500",
    },
    {
      title: "Largest Holding",
      value: portfolio?.largestHolding?.symbol ?? "-",
      icon: <Trophy size={24} />,
      color: "bg-yellow-500",
    },
    {
      title: "Largest Chain",
      value: portfolio?.largestHolding?.chain ?? "-",
      icon: <Wallet size={24} />,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-slate-900 rounded-xl p-5 border border-slate-700 hover:border-blue-500 transition"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">
                {card.title}
              </p>

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