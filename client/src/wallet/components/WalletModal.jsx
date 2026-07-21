import { useEffect } from "react";
import { useWallet } from "../hooks/useWallet";

function WalletModal({ isOpen, onClose }) {
  const {
    connectMetaMask,
    connectWalletConnect,
    connectCoinbase,

    disconnect,

    isConnected,
    isPending,
    error,

    shortAddress,
    walletName,
    chain,
    balance,
    symbol,
  } = useWallet();

  // Bağlantı başarılı olunca modalı kapat
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        onClose();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isConnected, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <h2 className="mb-6 text-center text-2xl font-bold">
          Wallet Manager
        </h2>

        {isConnected ? (
          <>
            <div className="rounded-xl border p-5 space-y-3">

              <div>
                <p className="text-sm text-gray-500">
                  Wallet
                </p>

                <p className="font-semibold">
                  {walletName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Address
                </p>

                <p className="font-mono">
                  {shortAddress}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Network
                </p>

                <p>
                  {chain?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Balance
                </p>

                <p>
                  {balance} {symbol}
                </p>
              </div>
            </div>

            <button
              onClick={disconnect}
              className="mt-5 w-full rounded-xl bg-red-500 p-3 font-semibold text-white hover:bg-red-600 transition"
            >
              Disconnect Wallet
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3">

              <button
                disabled={isPending}
                onClick={connectMetaMask}
                className="w-full rounded-xl bg-orange-500 p-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🦊 MetaMask
              </button>

              <button
                disabled={isPending}
                onClick={connectWalletConnect}
                className="w-full rounded-xl bg-blue-500 p-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🔗 WalletConnect
              </button>

              <button
                disabled={isPending}
                onClick={connectCoinbase}
                className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🔵 Coinbase Wallet
              </button>
            </div>
          </>
        )}

        {isPending && (
          <div className="mt-5 rounded-lg bg-blue-50 p-3 text-center text-blue-600">
            Connecting wallet...
          </div>
        )}

        {error && (
  <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
    <strong>Wallet Error:</strong>
    <br />
    {error.message}
  </div>
)}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl border p-3 font-semibold transition hover:bg-gray-100"
        >
          Close
        </button>

      </div>
    </div>
  );
}

export default WalletModal;