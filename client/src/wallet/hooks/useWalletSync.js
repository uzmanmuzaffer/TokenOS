import { useEffect } from "react";
import { useWallet } from "./useWallet";
import useWalletStore from "../../store/walletStore";


export default function useWalletSync() {

  const {
    address,
    isConnected,
  } = useWallet();


  const {
    setWallet,
    clearWallet,
  } = useWalletStore();



  useEffect(() => {

    if (isConnected && address) {

      setWallet(address);

    } else {

      clearWallet();

    }

  }, [
    address,
    isConnected,
    setWallet,
    clearWallet,
  ]);

}