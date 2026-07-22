import { useState } from "react";
import { FaTimes, FaGem } from "react-icons/fa";

import {
  useAccount,
  useWriteContract,
  useSwitchChain,
} from "wagmi";

import {
  parseUnits,
} from "viem";

import { base } from "wagmi/chains";

import { useWallet } from "../../wallet/hooks/useWallet";


const USDC_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";


const PREMIUM_WALLET =
  "0x5089b3D4f87912c303f92ED97B51f2d1592eC056";



const USDC_ABI = [

  {
    name: "transfer",

    type: "function",

    stateMutability: "nonpayable",

    inputs: [

      {
        name: "to",
        type: "address",
      },

      {
        name: "amount",
        type: "uint256",
      },

    ],

    outputs: [

      {
        name: "",
        type: "bool",
      },

    ],

  },

];



export default function PremiumModal({

  isOpen,

  onClose,

}) {


  const {
    address,
    isConnected,
  } = useWallet();



  const {
    chainId,
  } = useAccount();



  const {
    writeContractAsync,
  } = useWriteContract();



  const {
    switchChainAsync,
  } = useSwitchChain();



  const [loading, setLoading] =
    useState(false);



  if (!isOpen) return null;



  const handlePremiumPayment = async () => {


    try {


      if (!isConnected || !address) {

        alert(
          "Önce cüzdanınızı bağlayın"
        );

        return;

      }



      setLoading(true);



      // Base Mainnet kontrolü

      if (chainId !== 8453) {

        await switchChainAsync({

          chainId: 8453,

        });

      }



      console.log(
        "USDC payment started"
      );



      const txHash =
        await writeContractAsync({

          address: USDC_ADDRESS,

          abi: USDC_ABI,

          functionName: "transfer",

          args: [

            PREMIUM_WALLET,

            parseUnits(
              "0.5",
              6
            ),

          ],

        });



      console.log(
        "Transaction:",
        txHash
      );



      const verifyResponse =
        await fetch(
          "http://localhost:5000/api/payment/verify",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },


            body: JSON.stringify({

              txHash,

              wallet:
                address,

            }),

          }

        );



      const verifyData =
        await verifyResponse.json();



      if (!verifyData.success) {

        alert(
          "Ödeme doğrulanamadı"
        );

        return;

      }



      const reportResponse =
        await fetch(
          "http://localhost:5000/api/premium/ai-report",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },


            body: JSON.stringify({

              wallet:
                address,

            }),

          }

        );



      const report =
        await reportResponse.json();



      console.log(
        "AI Report:",
        report
      );



      alert(
        "Premium AI Report açıldı!"
      );



    }

    catch(error) {


      console.error(
        "Premium payment error:",
        error
      );


      alert(
        error.message ||
        "Ödeme işlemi başarısız"
      );


    }

    finally {

      setLoading(false);

    }


  };




  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">


      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">


        <div className="flex items-center justify-between border-b border-slate-700 p-5">


          <div className="flex items-center gap-3">

            <FaGem className="text-xl text-cyan-400" />

            <h2 className="text-xl font-bold text-white">

              TokenOS Premium

            </h2>

          </div>


          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >

            <FaTimes size={20}/>

          </button>


        </div>



        <div className="space-y-5 p-6">


          <div className="rounded-xl bg-slate-800 p-4">

            <p className="text-sm text-slate-400">
              Premium AI Report
            </p>

            <h3 className="mt-2 text-2xl font-bold text-cyan-400">
              0.50 USDC
            </h3>

          </div>



          <button

            onClick={handlePremiumPayment}

            disabled={loading}

            className="
              w-full
              rounded-xl
              bg-cyan-500
              py-3
              font-bold
              text-white
              hover:bg-cyan-600
              disabled:opacity-50
            "

          >

            {loading
              ? "Processing..."
              : "Pay 0.50 USDC"
            }


          </button>



        </div>


      </div>


    </div>

  );

}