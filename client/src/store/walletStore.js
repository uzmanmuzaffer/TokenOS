import { create } from "zustand";
import { analyzeWallet, getAIWalletReport } from "../services/api";

function buildScanError(result) {
  if (!result) {
    return "Wallet analysis failed.";
  }

  if (result.success === false && result.error) {
    return result.error;
  }

  const failed = Array.isArray(result.chains)
    ? result.chains.filter((chain) => chain?.success === false)
    : [];

  const successful = Number(
    result.successfulChains ?? result.portfolio?.totalChains ?? 0
  );

  if (successful === 0 && failed.length > 0) {
    const first = failed[0]?.error || "Chain scan failed";
    return `On-chain data source failed (${failed.length} networks). ${first}`;
  }

  return null;
}

const useWalletStore = create((set, get) => ({
  wallet: "",
  data: null,
  portfolio: null,
  security: null,
  score: null,
  aiReport: null,
  loading: false,
  aiLoading: false,
  error: null,

  setWallet: (wallet) => set({ wallet }),

  analyze: async (address) => {
    const wallet = String(address || get().wallet || "").trim();

    if (!wallet) {
      return;
    }

    set({
      wallet,
      loading: true,
      error: null,
      aiReport: null,
    });

    try {
      const result = await analyzeWallet(wallet);
      const error = buildScanError(result);

      set({
        data: result,
        portfolio: result?.portfolio || null,
        security: result?.security || null,
        score: result?.score || null,
        loading: false,
        error,
      });
    } catch (err) {
      console.error("Wallet Analyze Error:", err);

      set({
        loading: false,
        error: err.message || "Wallet analysis failed",
      });
    }
  },

  generateAIReport: async () => {
    const { wallet, data } = get();

    if (!wallet || !data) {
      return;
    }

    set({
      aiLoading: true,
      error: null,
    });

    try {
      const result = await getAIWalletReport(wallet);

      set({
        aiReport: result,
        aiLoading: false,
      });
    } catch (err) {
      console.error("AI Report Error:", err);

      set({
        aiLoading: false,
        error: err.message || "AI report failed",
      });
    }
  },

  clearWallet: () =>
    set({
      wallet: "",
      data: null,
      portfolio: null,
      security: null,
      score: null,
      aiReport: null,
      loading: false,
      aiLoading: false,
      error: null,
    }),
}));

export default useWalletStore;