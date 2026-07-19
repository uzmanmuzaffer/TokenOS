import { useWallet } from "../hooks/useWallet";


function WalletModal({ isOpen, onClose }) {

  const {
    connectMetaMask,
    connectWalletConnect,
    connectCoinbase,
    isPending,
    error,
  } = useWallet();



  if (!isOpen) return null;



  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">


        <h2 className="text-xl font-bold mb-6">
          Connect Wallet
        </h2>



        <div className="space-y-3">


          <button
            onClick={connectMetaMask}
            className="w-full p-3 rounded-lg bg-orange-500 text-white"
          >
            🦊 MetaMask
          </button>



          <button
            onClick={connectWalletConnect}
            className="w-full p-3 rounded-lg bg-blue-500 text-white"
          >
            🔗 WalletConnect
          </button>



          <button
            onClick={connectCoinbase}
            className="w-full p-3 rounded-lg bg-indigo-600 text-white"
          >
            🔵 Coinbase Wallet
          </button>


        </div>



        {isPending && (

          <p className="mt-4 text-sm">
            Connecting...
          </p>

        )}



        {error && (

          <p className="mt-4 text-sm text-red-500">

            {error.message}

          </p>

        )}



        <button

          onClick={onClose}

          className="mt-5 w-full border p-2 rounded-lg"

        >

          Cancel

        </button>


      </div>

    </div>

  );

}


export default WalletModal;