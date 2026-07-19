import { useState } from "react";
import WalletTokenCard from "./WalletTokenCard";
import {
  ChevronDown,
  Network,
  Coins,
} from "lucide-react";


export default function MultiChainAssets({ data }) {

  const [openChain, setOpenChain] = useState(null);


  if (!data?.results?.length) {
    return null;
  }


  return (
    <div className="mt-8">

      <h2 className="
        text-2xl
        font-bold
        text-white
        mb-6
      ">
        🌐 Multi Chain Portfolio
      </h2>



      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-5
      ">


        {data.results.map((chainData) => {


          const isOpen =
            openChain === chainData.chain;


          return (

            <div
              key={chainData.chain}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                overflow-hidden
                transition
              "
            >


              {/* Network Card */}

              <button
                onClick={() =>
                  setOpenChain(
                    isOpen
                      ? null
                      : chainData.chain
                  )
                }
                className="
                  w-full
                  p-5
                  flex
                  items-center
                  justify-between
                  hover:bg-slate-800
                  transition
                "
              >


                <div className="flex items-center gap-4">

                  <div className="
                    w-12
                    h-12
                    rounded-xl
                    bg-cyan-500/20
                    flex
                    items-center
                    justify-center
                  ">
                    <Network
                      className="text-cyan-400"
                    />
                  </div>


                  <div className="text-left">

                    <h3 className="
                      text-lg
                      font-bold
                      text-white
                    ">
                      {chainData.chain}
                    </h3>


                    <p className="
                      text-sm
                      text-slate-400
                    ">
                      {chainData.tokens?.length || 0}
                      {" "}
                      Assets
                    </p>

                  </div>

                </div>



                <ChevronDown
                  className={`
                    text-slate-400
                    transition
                    ${
                      isOpen
                      ? "rotate-180"
                      : ""
                    }
                  `}
                />


              </button>




              {/* Token List */}


              {isOpen && (

                <div className="
                  border-t
                  border-slate-800
                  p-5
                  space-y-3
                  max-h-[500px]
                  overflow-y-auto
                ">


                  {chainData.tokens?.length > 0 ? (

                    chainData.tokens.map(
                      (token,index)=>(
                        
                        <WalletTokenCard
                          key={
                            token.address ||
                            token.token_address ||
                            index
                          }
                          token={token}
                        />

                      )
                    )

                  ) : (

                    <div className="
                      text-slate-500
                      flex
                      items-center
                      gap-2
                    ">
                      <Coins size={18}/>
                      No assets found
                    </div>

                  )}


                </div>

              )}


            </div>

          );

        })}


      </div>


    </div>
  );
}