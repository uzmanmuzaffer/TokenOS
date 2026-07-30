export default function WalletTokenCard({ token }) {
  const decimals = Number(token?.decimals ?? 18);

  let balance = 0;

  if (token?.balance_formatted !== undefined) {
    balance = Number(token.balance_formatted);
  } else {
    const rawBalance = token?.balance ?? token?.amount ?? "0";

    try {
      balance =
        Number(rawBalance) / Math.pow(10, decimals);
    } catch {
      balance = 0;
    }
  }

  const formattedBalance = Number.isFinite(balance)
    ? balance.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    : "0";

  const usdValue = Number(
    token?.usdValue ??
      token?.usd_value ??
      token?.value ??
      0
  );

  const price = Number(
    token?.price ??
      token?.usd_price ??
      token?.usdPrice ??
      0
  );

  return (
    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        p-4
        flex
        justify-between
        items-center
        hover:border-cyan-500
        transition
      "
    >
      <div>
        <h4 className="text-white font-semibold">
          {token?.name || "Unknown Token"}
        </h4>

        <p className="text-slate-400 text-sm">
          {token?.symbol || "-"}
        </p>
      </div>

      <div className="text-right">
        <p className="text-slate-400 text-sm">
          Balance
        </p>

        <p className="text-white font-bold">
          {formattedBalance} {token?.symbol}
        </p>

        {usdValue > 0 && (
          <p className="text-green-400 text-sm mt-1">
            ${usdValue.toFixed(2)}
          </p>
        )}

        {price > 0 && (
          <p className="text-slate-500 text-xs mt-1">
            Price ${price.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}