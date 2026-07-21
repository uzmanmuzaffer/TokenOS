export default function WalletTokenCard({ token }) {


  const decimals = Number(
    token?.decimals ?? 18
  );


  const rawBalance =
    token?.balance ??
    token?.amount ??
    "0";



  const formattedBalance = (() => {

    try {

      const value =
        Number(rawBalance) /
        Math.pow(10, decimals);


      return value.toLocaleString(
        undefined,
        {
          maximumFractionDigits: 6,
        }
      );


    } catch {

      return "0";

    }

  })();



  const usdValue =
    token?.usd_value ??
    token?.usdValue ??
    token?.value ??
    null;



  const price =
    token?.price ??
    token?.usd_price ??
    token?.usdPrice ??
    null;



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



        {usdValue && (

          <p className="text-green-400 text-sm mt-1">

            ${Number(usdValue).toFixed(2)}

          </p>

        )}



        {price && (

          <p className="text-slate-500 text-xs mt-1">

            Price ${Number(price).toFixed(6)}

          </p>

        )}



      </div>


    </div>

  );

}