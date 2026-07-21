import { useState } from "react";

import useWalletStore from "../store/walletStore";

import WalletHeader from "./wallet/WalletHeader";
import WalletSummary from "./wallet/WalletSummary";
import WalletTokenCard from "./wallet/WalletTokenCard";
import RiskAnalysis from "./wallet/RiskAnalysis";
import AIWalletReport from "./wallet/AIWalletReport";


export default function WalletAnalyzer() {


  const [showAllTokens, setShowAllTokens] = useState(false);



  const {
    wallet,
    data,
    loading,
    aiReport,
    aiLoading,
    error,
    analyze,
    generateAIReport,
  } = useWalletStore();



  const portfolio = data?.portfolio;



  const tokens =
    portfolio?.tokens ||
    data?.tokens ||
    [];



  const visibleTokens = showAllTokens
    ? tokens
    : tokens.slice(0, 5);



  return (

    <div
      className="
        bg-slate-950
        rounded-2xl
        p-8
        shadow-xl
        border
        border-slate-800
        text-white
      "
    >



      <WalletHeader

        wallet={
          data?.wallet ||
          wallet
        }

        chain={
          data?.chain ??
          `${portfolio?.totalChains ?? data?.analyzedChains ?? 0} Chains`
        }

        tokenCount={
          portfolio?.totalTokens ??
          data?.tokenCount ??
          tokens.length
        }

      />




      {/* Wallet Actions */}

      <div className="flex gap-3 mt-8 items-center">


        <div
          className="
            flex-1
            p-3
            rounded-lg
            bg-slate-900
            border
            border-slate-700
            text-slate-300
            truncate
          "
        >

          {wallet
            ? wallet
            : "Wallet not connected"
          }

        </div>



        <button

          onClick={analyze}

          disabled={
            loading ||
            !wallet
          }

          className="
            px-6
            py-3
            rounded-lg
            bg-blue-600
            hover:bg-blue-700
            disabled:opacity-50
            font-semibold
          "

        >

          {loading
            ? "Analyzing..."
            : "Analyze"
          }

        </button>



        <button

          onClick={generateAIReport}

          disabled={
            aiLoading ||
            !data
          }

          className="
            px-6
            py-3
            rounded-lg
            bg-purple-600
            hover:bg-purple-700
            disabled:opacity-50
            font-semibold
          "

        >

          {aiLoading
            ? "Generating..."
            : "AI Report"
          }

        </button>


      </div>





      {/* Error */}

      {error && (

        <div
          className="
            mt-6
            rounded-xl
            border
            border-red-700
            bg-red-900/30
            p-4
          "
        >

          <h3 className="font-bold text-red-400">
            Error
          </h3>


          <p className="mt-2 text-red-300">
            {error}
          </p>


        </div>

      )}






      {/* Portfolio */}

      <div className="mt-8">

        <WalletSummary
          data={data}
        />

      </div>






      {/* Risk */}

      <div className="mt-8">

        <RiskAnalysis

          security={
            data?.security
          }

          score={
            data?.score
          }

        />

      </div>






      {/* AI Report */}

      <div className="mt-8">

        <AIWalletReport

          report={aiReport}

        />

      </div>








      {/* Token Portfolio */}

      {tokens.length > 0 && (

        <div className="mt-8">


          <div
            className="
              flex
              items-center
              justify-between
              mb-5
            "
          >

            <h2 className="text-2xl font-bold">

              Token Portfolio

            </h2>


            <span className="text-sm text-slate-400">

              {tokens.length} Assets

            </span>


          </div>





          <div className="space-y-3">


            {visibleTokens.map(

              (token, index) => (

                <WalletTokenCard

                  key={
                    token.address ||
                    token.token_address ||
                    `${token.symbol}-${index}`
                  }

                  token={token}

                />

              )

            )}


          </div>





          {tokens.length > 5 && (

            <button

              onClick={() =>
                setShowAllTokens(!showAllTokens)
              }

              className="
                mt-5
                px-5
                py-2
                rounded-lg
                bg-slate-800
                hover:bg-slate-700
                text-white
              "

            >

              {showAllTokens
                ? "Show Less"
                : `View All ${tokens.length} Tokens`
              }


            </button>

          )}


        </div>

      )}



    </div>

  );

}