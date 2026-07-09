import { useState } from "react";
import { analyzeWallet } from "../services/api";

export default function WalletAnalyzer() {
  const [wallet, setWallet] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!wallet) return;

    setLoading(true);

    const result = await analyzeWallet(wallet);

    setData(result);

    setLoading(false);
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl">

      <h2 className="text-3xl font-bold mb-6">
        Wallet Analyzer
      </h2>

      <div className="flex gap-3">

        <input
          className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 outline-none"
          placeholder="0x Wallet Address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

      </div>

      {data?.success && (

        <>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

            <div className="bg-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">Wallet</p>

              <p className="mt-2 break-all text-sm">
                {data.wallet}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Network
              </p>

              <p className="text-2xl font-bold mt-2">
                {data.chain}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Tokens
              </p>

              <p className="text-2xl font-bold mt-2">
                {data.tokenCount}
              </p>
            </div>

          </div>

          <div className="mt-8">

            <h3 className="text-2xl font-semibold mb-4">
              Token Portfolio
            </h3>

            <div className="space-y-3">

              {data.tokens.map((token, index) => (

                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-4 flex justify-between items-center"
                >

                  <div>

                    <div className="font-semibold">
                      {token.name || "Unknown Token"}
                    </div>

                    <div className="text-gray-400 text-sm">
                      {token.symbol || "-"}
                    </div>

                  </div>

                  <div className="text-right">

                    <div className="text-sm text-gray-300">
                      Decimals
                    </div>

                    <div className="font-bold">
                      {token.decimals}
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </>

      )}

      {data?.success === false && (

        <div className="mt-6 bg-red-900/40 border border-red-700 rounded-xl p-4">

          <div className="font-bold text-red-400">
            Wallet analysis failed
          </div>

          <div className="mt-2 text-red-300 text-sm">
            {data.error}
          </div>

        </div>

      )}

    </div>
  );
}

