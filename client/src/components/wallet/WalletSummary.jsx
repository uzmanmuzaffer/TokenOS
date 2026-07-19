import {
  FaWallet,
  FaCoins,
  FaNetworkWired,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";

export default function WalletSummary({ data }) {
  if (!data?.success) return null;

  const portfolio = data.portfolio || {};

  const largestHolding =
    portfolio.largestHolding || {};

  const formatMoney = (value) => {
    if (!value) return "$0";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };


  const cards = [
    {
      title: "Wallet",
      value: data.wallet,
      icon: <FaWallet className="text-cyan-400" />,
      small: true,
    },

    {
      title: "Networks",
      value: portfolio.totalChains ?? 0,
      icon: <FaNetworkWired className="text-purple-400" />,
    },

    {
      title: "Assets",
      value: portfolio.totalTokens ?? 0,
      icon: <FaCoins className="text-yellow-400" />,
    },

    {
      title: "Portfolio Value",
      value: formatMoney(
        portfolio.totalValue
      ),
      icon: <FaChartLine className="text-green-400" />,
    },

    {
      title: "Largest Holding",
      value:
        largestHolding.symbol || "-",
      sub:
        largestHolding.value
          ? `${formatMoney(
              largestHolding.value
            )} (${largestHolding.allocation || 0}%)`
          : null,
      icon: <FaTrophy className="text-orange-400" />,
    },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">

      {cards.map((card) => (

        <div
          key={card.title}
          className="
            bg-slate-900
            border border-slate-800
            rounded-2xl
            p-5
            hover:border-cyan-500
            transition
          "
        >

          <div className="flex items-center justify-between">

            <p className="text-slate-400 text-sm">
              {card.title}
            </p>

            {card.icon}

          </div>


          <p
            className={`
              mt-4
              font-bold
              ${
                card.small
                  ? "text-sm break-all"
                  : "text-2xl"
              }
            `}
          >
            {card.value}
          </p>


          {card.sub && (

            <p className="text-xs text-slate-400 mt-2">
              {card.sub}
            </p>

          )}

        </div>

      ))}

    </div>
  );
}