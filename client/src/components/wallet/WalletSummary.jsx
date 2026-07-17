import {
  FaWallet,
  FaEthereum,
  FaCoins,
  FaShieldAlt,
} from "react-icons/fa";

export default function WalletSummary({ data }) {
  if (!data?.success) return null;

  const riskLevel = data.riskScore?.level || "--";

  const riskColor =
    riskLevel === "LOW"
      ? "bg-green-500/20 text-green-400"
      : riskLevel === "MEDIUM"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-red-500/20 text-red-400";

  const cards = [
    {
      title: "Wallet",
      value: data.wallet,
      icon: <FaWallet className="text-cyan-400" />,
      small: true,
    },
    {
      title: "Network",
      value: data.chain,
      icon: <FaEthereum className="text-purple-400" />,
    },
    {
      title: "Tokens",
      value: data.tokenCount,
      icon: <FaCoins className="text-yellow-400" />,
    },
    {
      title: "Risk Score",
      value: data.riskScore?.score ?? "--",
      icon: <FaShieldAlt className="text-red-400" />,
      badge: riskLevel,
      badgeClass: riskColor,
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
            <p className="text-slate-400 text-sm">{card.title}</p>
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

          {card.badge && (
            <span
              className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold ${card.badgeClass}`}
            >
              {card.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}