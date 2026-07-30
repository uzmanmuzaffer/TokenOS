import { useWallet } from "../hooks/useWallet";

function WalletModal({ isOpen, onClose }) {
  const {
    connectors,
    connectWallet,
    isPending,
    error,
  } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async (connector) => {
    try {
      await connectWallet(connector);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            Connect Wallet
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              disabled={isPending}
              onClick={() => handleConnect(connector)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-4 py-4 text-white hover:bg-slate-700 transition"
            >
              <span>{connector.name}</span>
              <span>→</span>
            </button>
          ))}

          {isPending && (
            <p className="text-cyan-400 text-sm">
              Connecting...
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm break-all">
              {error.message}
            </p>
          )}
        </div>

        <div className="border-t border-slate-700 p-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-600 py-3 text-white hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;