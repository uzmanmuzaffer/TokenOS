import {
  FaWallet,
  FaCoins,
  FaNetworkWired,
  FaTrophy,
} from "react-icons/fa";

export default function WalletSummary({ data }) {
  if (!data?.success) return null;

  const portfolio = data.portfolio;

  const cards = [
    {
      title: "Wallet",
      value: data.wallet,
      icon: <FaWallet className="text-cyan-400" />,
      small: true,
    },
    {
      title: "Analyzed Chains",
      value: portfolio?.totalChains ?? 0,
      icon: <FaNetworkWired className="text-purple-400" />,
    },
    {
      title: "Total Tokens",
      value: portfolio?.totalTokens ?? 0,
      icon: <FaCoins className="text-yellow-400" />,
    },
    {
      title: "Largest Holding",
      value: portfolio?.largestHolding?.symbol ?? "-",
      icon: <FaTrophy className="text-green-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              {card.title}
            </p>

            {card.icon}
          </div>

          <p
            className={`mt-4 font-bold ${
              card.small
                ? "text-sm break-all"
                : "text-3xl"
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}