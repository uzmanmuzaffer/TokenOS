import { useWallet } from "../hooks/useWallet";


function WalletInfo() {

  const {
    address,
    isConnected,
    chainId,
    balance,
    connector,
  } = useWallet();



  if (!isConnected) {

    return (

      <div className="p-4 rounded-lg border">

        Wallet not connected

      </div>

    );

  }



  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;



  return (

    <div className="p-5 rounded-xl border shadow-sm space-y-3">


      <h3 className="text-lg font-bold">
        Wallet Information
      </h3>



      <div>

        <span className="font-semibold">
          Address:
        </span>

        <br />

        {shortAddress}

      </div>



      <div>

        <span className="font-semibold">
          Network ID:
        </span>

        <br />

        {chainId}

      </div>



      <div>

        <span className="font-semibold">
          Balance:
        </span>

        <br />

        {balance
          ? `${balance.formatted} ${balance.symbol}`
          : "Loading..."
        }

      </div>



      <div>

        <span className="font-semibold">
          Connector:
        </span>

        <br />

        {connector?.name}

      </div>


    </div>

  );

}


export default WalletInfo;