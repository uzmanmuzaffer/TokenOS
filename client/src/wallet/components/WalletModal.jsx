
import { useWallet } from "../hooks/useWallet";

function WalletIcon({ name }) {
  const n = name.toLowerCase();

  if (n.includes("metamask")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20">
        🦊
      </div>
    );
  }

  if (n.includes("coinbase")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg ring-1 ring-blue-500/20">
        🔵
      </div>
    );
  }

  if (n.includes("walletconnect")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-lg ring-1 ring-cyan-500/20">
        ◈
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg ring-1 ring-slate-700">
      ◇
    </div>
  );
}

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
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1/2 top-20 w-[380px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_25px_80px_rgba(0,0,0,0.65)]"
      >
        {/* Top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-500/10 to-transparent" />

        {/* Header */}
        <div className="relative flex items-start justify-between px-5 pb-4 pt-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10 text-sm text-cyan-400 ring-1 ring-cyan-400/20">
                ◈
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                TokenOS
              </span>
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-white">
              Connect Wallet
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Connect your wallet to access TokenOS.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close wallet modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Wallet list */}
        <div className="relative px-5 pb-4">
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                disabled={isPending}
                onClick={() => handleConnect(connector)}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition-all duration-200 hover:border-cyan-400/25 hover:bg-white/[0.055] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <WalletIcon name={connector.name} />

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">
                    {connector.name}
                  </div>

                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Connect securely
                  </div>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition group-hover:bg-cyan-400/10 group-hover:text-cyan-400">
                  →
                </div>
              </button>
            ))}
          </div>

          {/* Connecting */}
          {isPending && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              <span className="text-xs text-cyan-300">
                Waiting for wallet confirmation...
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-lg border border-red-400/10 bg-red-400/5 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-red-300">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] bg-black/10 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Base Network
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-500 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;

