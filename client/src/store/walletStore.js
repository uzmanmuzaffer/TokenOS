
import { create } from "zustand";
import {
  analyzeWallet,
  getAIWalletReport,
} from "../services/api";

function reportText(result) {
  const ai = result?.ai;

  if (typeof ai?.report === "string") {
    return ai.report;
  }

  if (typeof ai?.report?.report === "string") {
    return ai.report.report;
  }

  if (typeof result?.report?.aiReport === "string") {
    return result.report.aiReport;
  }

  if (typeof result?.report === "string") {
    return result.report;
  }

  return "";
}

function buildScanError(result) {
  if (!result) {
    return "Wallet analysis failed.";
  }

  if (result.success === false && result.error) {
    return result.error;
  }

  return null;
}

/**
 * Backend'den gelen:
 *
 * results: [
 *   { chain, tokens: [...] },
 *   { chain, tokens: [...] }
 * ]
 *
 * yapısını tek bir token listesine çevirir.
 */
function flattenTokens(result) {
  if (!Array.isArray(result?.results)) {
    return [];
  }

  return result.results.flatMap((chainResult) => {
    if (!Array.isArray(chainResult?.tokens)) {
      return [];
    }

    return chainResult.tokens.map((token) => ({
      ...token,
      chain:
        token?.chain ||
        chainResult?.chain ||
        "",
      chainId:
        token?.chainId ||
        chainResult?.chainId ||
        "",
    }));
  });
}

function normalizePortfolio(result) {
  const backendPortfolio = result?.portfolio || {};
  const tokens = flattenTokens(result);

  return {
    ...backendPortfolio,

    totalChains:
      backendPortfolio.totalChains ??
      result?.analyzedChains ??
      0,

    totalTokens:
      backendPortfolio.totalTokens ??
      tokens.length,

    totalValue:
      backendPortfolio.totalValue ??
      0,

    tokens,

    chains:
      backendPortfolio.chains ||
      result?.chains ||
      [],
  };
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
    const wallet = String(
      address || get().wallet || ""
    ).trim();

    if (!wallet) {
      return null;
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

      const portfolio = normalizePortfolio(result);

      const text =
        result?.report?.report ||
        result?.report ||
        reportText(result);

      /**
       * Frontend'in kullanacağı normalize edilmiş veri.
       *
       * Backend verisini bozmuyoruz.
       * Sadece portfolio.tokens ekliyoruz.
       */
      const normalizedResult = {
        ...result,
        portfolio,
      };

      set({
        data: normalizedResult,
        portfolio,
        security: result?.security || null,
        score: result?.score || null,

        aiReport: {
          score: result?.score || null,
          security: result?.security || null,
          portfolio,
          content:
            text ||
            result?.error ||
            "AI report unavailable.",
        },

        loading: false,
        error,
      });

      return normalizedResult;
    } catch (err) {
      console.error(
        "Wallet analysis error:",
        err
      );

      set({
        loading: false,
        error:
          err.message ||
          "Wallet analysis failed",
      });

      return null;
    }
  },

  generateAIReport: async () => {
    const { wallet, data } = get();

    if (!wallet || !data) {
      return null;
    }

    set({
      aiLoading: true,
      error: null,
    });

    try {
      const result =
        await getAIWalletReport(wallet);

      if (!result?.success) {
        set({
          aiLoading: false,
          error:
            result?.error ||
            "AI report could not be generated.",
        });

        return result;
      }

      const text = reportText(result);

      const currentPortfolio =
        get().portfolio ||
        data?.portfolio ||
        null;

      set({
        aiReport: {
          score:
            result?.score ||
            data?.score ||
            null,

          security:
            result?.security ||
            data?.security ||
            null,

          portfolio:
            result?.portfolio ||
            currentPortfolio ||
            null,

          content:
            text ||
            result?.report ||
            "AI report generated successfully.",
        },

        aiLoading: false,
      });

      return result;
    } catch (err) {
      console.error(
        "AI report error:",
        err
      );

      set({
        aiLoading: false,
        error:
          err.message ||
          "AI report could not be generated.",
      });

      return null;
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

