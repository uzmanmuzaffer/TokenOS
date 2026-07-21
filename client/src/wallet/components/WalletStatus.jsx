import { useWallet } from "../hooks/useWallet";


function WalletStatus() {

  const {
    isConnected,
    isPending,
    error,
    connector,
  } = useWallet();



  if (isPending) {

    return (

      <div className="p-3 rounded-lg bg-yellow-100 text-yellow-800">

        Connecting wallet...

      </div>

    );

  }



  if (error) {

    return (

      <div className="p-3 rounded-lg bg-red-100 text-red-700">

        Wallet Error:
        <br />
        {error.message}

      </div>

    );

  }



  if (!isConnected) {

    return (

      <div className="p-3 rounded-lg bg-gray-100">

        Wallet disconnected

      </div>

    );

  }



  return (

    <div className="p-3 rounded-lg bg-green-100 text-green-700">

      Connected with {connector?.name}

    </div>

  );

}


export default WalletStatus;