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
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full
          max-w-md
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          bg-slate-900
          border
          border-slate-700
          shadow-2xl
          p-6
        "
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Connect Wallet
          </h2>

          <button
            onClick={onClose}
            className="
              text-slate-400
              hover:text-white
              text-xl
            "
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {connectors.length > 0 ? (
            connectors.map((connector) => (
              <button
                key={connector.uid}
                disabled={isPending}
                onClick={() => handleConnect(connector)}
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  bg-slate-800
                  hover:bg-slate-700
                  border
                  border-slate-700
                  px-4
                  py-4
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <span className="font-medium text-white">
                  {connector.name}
                </span>

                <span className="text-cyan-400">
                  →
                </span>
              </button>
            ))
          ) : (
            <div className="text-center text-slate-400 py-6">
              No wallet connectors found.
            </div>
          )}
        </div>

        {isPending && (
          <div className="mt-5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 p-3">
            <p className="text-cyan-300 text-sm">
              Connecting wallet...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-red-400 text-sm break-words">
              {error.message}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="
            mt-6
            w-full
            rounded-xl
            border
            border-slate-600
            py-3
            text-white
            hover:bg-slate-800
            transition
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default WalletModal;