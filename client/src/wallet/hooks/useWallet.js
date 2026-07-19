import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";


export function useWallet(){

  const {
    address,
    isConnected,
  } = useAccount();


  const {
    connect,
    connectors,
    isPending,
    error,
  } = useConnect();


  const {
    disconnect,
  } = useDisconnect();



  const connectMetaMask = async () => {

    const connector = connectors.find(
      (item) =>
        item.name
        .toLowerCase()
        .includes("metamask")
    );


    if (!connector) {

      console.log("MetaMask bulunamadı");

      return;

    }


    await connect({
      connector,
    });

  };



  const connectWalletConnect = async () => {

    const connector = connectors.find(
      (item) =>
        item.name
        .toLowerCase()
        .includes("walletconnect")
    );


    if (!connector) {

      console.log("WalletConnect bulunamadı");

      return;

    }


    await connect({
      connector,
    });

  };



  const connectCoinbase = async () => {

    const connector = connectors.find(
      (item) =>
        item.name
        .toLowerCase()
        .includes("coinbase")
    );


    if (!connector) {

      console.log("Coinbase bulunamadı");

      return;

    }


    await connect({
      connector,
    });

  };



  return {

    address,

    isConnected,


    connectors,

    isPending,

    error,


    connectMetaMask,

    connectWalletConnect,

    connectCoinbase,


    disconnect,

  };

}