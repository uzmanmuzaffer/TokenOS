import {
  FaDatabase,
  FaShieldAlt,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { getTokens } from "../services/api";


function TokenTable() {

  const [tokens, setTokens] = useState([]);


  useEffect(() => {

    async function loadTokens(){

      const data = await getTokens();

      setTokens(data);

    }


    loadTokens();

  }, []);



  return (

    <div className="
    bg-slate-900/80
    border
    border-slate-800
    rounded-2xl
    overflow-hidden">


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

            Live blockchain market analysis

          </p>

        </div>


        <FaDatabase
          className="
          text-cyan-400
          text-2xl"
        />


      </div>



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
                Volume
              </th>


              <th className="p-5">
                Chain
              </th>


              <th className="p-5">
                Risk
              </th>


            </tr>

          </thead>



          <tbody>


          {tokens.map((token)=>(


            <tr
            key={token.symbol}
            className="
            border-b
            border-slate-800
            hover:bg-slate-800/50
            transition">


              <td className="p-5">

                <p className="text-white font-semibold">
                  {token.name}
                </p>

                <p className="text-slate-500 text-sm">
                  {token.symbol}
                </p>

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



              <td className="
              p-5
              text-white">

                ${Number(token.volume).toLocaleString()}

              </td>



              <td className="
              p-5
              text-cyan-400">

                {token.chain}

              </td>



              <td className="p-5">

                <span className="
                flex
                items-center
                gap-2
                text-green-400">

                  <FaShieldAlt />

                  Active

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