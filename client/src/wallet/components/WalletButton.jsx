import { useState } from "react";

import { useWallet } from "../hooks/useWallet";
import WalletModal from "./WalletModal";


function WalletButton() {

  const [open, setOpen] = useState(false);


  const {
    address,
    isConnected,
    disconnectWallet,
  } = useWallet();



  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";



  if (isConnected) {

    return (

      <div className="flex items-center gap-3">


        <button
          className="
            px-4
            py-2
            rounded-lg
            bg-green-600
            text-white
          "
        >

          {shortAddress}

        </button>



        <button

          onClick={disconnectWallet}

          className="
            px-3
            py-2
            rounded-lg
            border
          "

        >

          Disconnect

        </button>


      </div>

    );

  }



  return (

    <>

      <button

        onClick={() => setOpen(true)}

        className="
          px-4
          py-2
          rounded-lg
          bg-blue-600
          text-white
        "

      >

        Connect Wallet

      </button>



      <WalletModal

        isOpen={open}

        onClose={() => setOpen(false)}

      />

    </>

  );

}


export default WalletButton;