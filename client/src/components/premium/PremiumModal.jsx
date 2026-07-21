import { FaTimes, FaGem } from "react-icons/fa";

import { useWallet } from "../../wallet/hooks/useWallet";


export default function PremiumModal({
  isOpen,
  onClose,
}) {

  const {
    address,
    isConnected,
  } = useWallet();


  if (!isOpen) return null;



  const handlePremiumPayment = async () => {

    try {

      console.log("💎 Premium payment started");


      if (!isConnected || !address) {

        alert(
          "Önce cüzdanınızı bağlayın"
        );

        return;

      }



      const response = await fetch(
        "http://localhost:5000/api/premium/ai-report",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            wallet: address,

          }),

        }
      );



      const data =
        await response.json();



      console.log(
        "Premium Response:",
        data
      );



      if (data.success) {

        alert(
          "Premium AI Report hazır!"
        );

      } else {

        alert(
          "Premium işlem başarısız"
        );

      }



    } catch(error) {


      console.error(
        "Premium error:",
        error
      );


      alert(
        "Sunucu hatası oluştu"
      );


    }

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">


      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">


        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-700 p-5">


          <div className="flex items-center gap-3">


            <FaGem className="text-xl text-cyan-400" />


            <h2 className="text-xl font-bold text-white">

              TokenOS Premium

            </h2>


          </div>



          <button

            onClick={onClose}

            className="text-slate-400 transition hover:text-white"

          >

            <FaTimes size={20} />

          </button>


        </div>





        {/* Body */}

        <div className="space-y-5 p-6">



          <div className="rounded-xl bg-slate-800 p-4">


            <p className="text-sm text-slate-400">

              Premium Status

            </p>


            <h3 className="mt-2 font-bold text-red-400">

              Not Active

            </h3>


          </div>





          <div className="rounded-xl bg-slate-800 p-4">


            <p className="text-sm text-slate-400">

              Plan

            </p>


            <h3 className="mt-2 font-semibold text-white">

              Premium AI Report

            </h3>


          </div>





          <div className="rounded-xl bg-slate-800 p-4">


            <p className="text-sm text-slate-400">

              Price

            </p>


            <h3 className="mt-2 text-2xl font-bold text-cyan-400">

              0.05 USDC

            </h3>


          </div>






          {!isConnected ? (


            <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4">


              <p className="mb-3 text-center text-yellow-300">

                Premium satın almak için önce cüzdanınızı bağlayın.

              </p>


              <button

                onClick={onClose}

                className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"

              >

                Connect Wallet

              </button>


            </div>



          ) : (


            <button

              onClick={handlePremiumPayment}

              className="
                w-full
                rounded-xl
                bg-cyan-500
                py-3
                font-bold
                text-white
                transition
                hover:bg-cyan-600
              "

            >

              Pay with USDC

            </button>


          )}



        </div>


      </div>


    </div>

  );

}