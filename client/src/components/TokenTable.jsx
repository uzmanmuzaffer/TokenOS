import {
  FaDatabase,
  FaShieldAlt,
} from "react-icons/fa";


const demoTokens = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "$67,420",
    change: "+2.4%",
    score: 96,
    risk: "Low",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: "$3,540",
    change: "+1.8%",
    score: 92,
    risk: "Low",
  },
  {
    name: "Solana",
    symbol: "SOL",
    price: "$178",
    change: "-0.5%",
    score: 84,
    risk: "Medium",
  },
];


function TokenTable() {

  return (

    <div className="
    bg-slate-900/80
    border
    border-slate-800
    rounded-2xl
    overflow-hidden">


      {/* Header */}

      <div className="
      p-6
      border-b
      border-slate-800
      flex
      justify-between
      items-center">

        <div>

          <h2 className="
          text-xl
          font-bold
          text-white">
            Token Intelligence
          </h2>

          <p className="
          text-sm
          text-slate-400
          mt-1">
            AI powered market analysis
          </p>

        </div>


        <FaDatabase
          className="
          text-cyan-400
          text-2xl"
        />

      </div>



      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">


          <thead>

            <tr className="
            text-left
            text-slate-400
            text-sm
            border-b
            border-slate-800">

              <th className="p-5">
                Token
              </th>

              <th className="p-5">
                Price
              </th>

              <th className="p-5">
                24H Change
              </th>

              <th className="p-5">
                AI Score
              </th>

              <th className="p-5">
                Risk
              </th>

            </tr>

          </thead>



          <tbody>

          {demoTokens.map((token)=>(

            <tr
            key={token.symbol}
            className="
            border-b
            border-slate-800
            hover:bg-slate-800/50
            transition">


              <td className="p-5">

                <div>

                  <p className="text-white font-semibold">
                    {token.name}
                  </p>

                  <p className="text-slate-500 text-sm">
                    {token.symbol}
                  </p>

                </div>

              </td>



              <td className="
              p-5
              text-white">

                {token.price}

              </td>



              <td className="
              p-5
              text-green-400">

                {token.change}

              </td>



              <td className="p-5">

                <span className="
                bg-cyan-500/10
                text-cyan-400
                px-3
                py-1
                rounded-full
                text-sm">

                  {token.score}%

                </span>

              </td>



              <td className="p-5">

                <span className="
                flex
                items-center
                gap-2
                text-green-400">

                  <FaShieldAlt />

                  {token.risk}

                </span>

              </td>


            </tr>

          ))}


          </tbody>


        </table>

      </div>


    </div>

  );

}


export default TokenTable;