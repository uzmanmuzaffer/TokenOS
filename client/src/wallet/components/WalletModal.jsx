
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Connect Wallet
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Choose a wallet to continue
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Wallets */}
        <div className="px-5 pb-4">
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                disabled={isPending}
                onClick={() => handleConnect(connector)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{connector.name}</span>

                <span className="text-slate-400">
                  →
                </span>
              </button>
            ))}
          </div>

          {/* Connecting */}
          {isPending && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              Connecting wallet...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-400">
              {error.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;

