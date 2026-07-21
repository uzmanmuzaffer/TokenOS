import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
} from "wagmi";


export function useWallet() {

  const {
    address,
    isConnected,
    connector,
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


  const chainId = useChainId();


  const {
    data: balance,
    isLoading: balanceLoading,
  } = useBalance({
    address,
  });


  const connectWallet = async (connector) => {

    try {

      await connect({
        connector,
      });

    } catch (error) {

      console.error(
        "Wallet connection error:",
        error
      );

    }

  };


  const disconnectWallet = () => {

    disconnect();

  };


  return {

    // wallet bilgileri
    address,
    isConnected,
    connector,
    chainId,

    // balance
    balance,
    balanceLoading,

    // bağlantı
    connectWallet,
    disconnectWallet,

    // connector listesi
    connectors,

    // durum
    isPending,
    error,

  };

}