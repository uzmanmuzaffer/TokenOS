import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
} from "wagmi";

export function useWallet() {
  const {
    address,
    isConnected,
    chain,
    chainId,
    connector,
    status,
  } = useAccount();

  const {
    connect,
    connectors,
    isPending,
    error,
  } = useConnect();

  const { disconnect } = useDisconnect();

  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  const connectByName = async (name) => {
    try {
      const walletConnector = connectors.find((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );

      if (!walletConnector) {
        console.warn(`${name} connector bulunamadı.`);
        return;
      }

      await connect({
        connector: walletConnector,
      });
    } catch (err) {
      console.error(`${name} bağlantı hatası:`, err);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return {
    // Account
    address,
    shortAddress,
    isConnected,
    status,

    // Chain
    chain,
    chainId,

    // Wallet
    connector,
    walletName: connector?.name ?? null,

    // Balance
    balance: balance?.formatted ?? "0",
    symbol: balance?.symbol ?? "",

    // Connect
    connectors,
    isPending,
    error,

    connectMetaMask: () => connectByName("metamask"),
    connectWalletConnect: () => connectByName("walletconnect"),
    connectCoinbase: () => connectByName("coinbase"),

    // Disconnect
    disconnect,
  };
}