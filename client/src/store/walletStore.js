import { create } from "zustand";
import { analyzeWallet } from "../services/api";

function reportText(result) {
  const ai = result?.ai;
  if (typeof ai?.report === "string") return ai.report;
  if (typeof ai?.report?.report === "string") return ai.report.report;
  if (typeof result?.report?.aiReport === "string") return result.report.aiReport;
  if (typeof result?.report === "string") return result.report;
  return "";
}

function buildScanError(result) {
  if (!result) return "Wallet analysis failed.";
  if (result.success === false && result.error) return result.error;
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
    if (!wallet) return;

    set({
      wallet,
      loading: true,
      error: null,
      aiReport: null,
    });

    try {
      const result = await analyzeWallet(wallet);
      const error = buildScanError(result);
      const text = reportText(result);

      set({
        data: result,
        portfolio: result?.portfolio || null,
        security: result?.security || null,
        score: result?.score || null,
        aiReport: {
          score: result?.score || null,
          security: result?.security || null,
          portfolio: result?.portfolio || null,
          content: text || result?.error || "AI report unavailable.",
        },
        loading: false,
        error,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Wallet analysis failed",
      });
    }
  },

  generateAIReport: async () => {
    const { wallet } = get();
    if (wallet) await get().analyze(wallet);
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