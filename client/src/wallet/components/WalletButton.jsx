import { useState } from "react";

import { useWallet } from "../hooks/useWallet";
import WalletModal from "./WalletModal";


function WalletButton() {

  const [open, setOpen] = useState(false);


  const {
    address,
    isConnected,
  } = useWallet();



  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";



  return (

    <>

      <button

        onClick={() => setOpen(true)}

        className="
          px-4
          py-2
          rounded-lg
          bg-black
          text-white
          hover:opacity-80
        "

      >

        {isConnected
          ? shortAddress
          : "Connect Wallet"
        }


      </button>



      <WalletModal

        isOpen={open}

        onClose={() => setOpen(false)}

      />


    </>

  );

}


export default WalletButton;