import { create } from "zustand";
import { analyzeWallet, getAIWalletReport } from "../services/api";

const useWalletStore = create((set, get) => ({

  // =========================
  // State
  // =========================

  wallet: "",
  data: null,

  portfolio: null,
  security: null,
  score: null,

  aiReport: null,

  loading: false,
  aiLoading: false,

  error: null,


  // =========================
  // Actions
  // =========================

  setWallet: (wallet) =>
    set({
      wallet,
    }),


  analyze: async () => {

    const { wallet } = get();

    if (!wallet) {
      return;
    }


    set({
      loading: true,
      error: null,
      aiReport: null,
    });


    try {

      const result = await analyzeWallet(wallet);


      set({

        data: result,

        portfolio:
          result?.portfolio || null,

        security:
          result?.security || null,

        score:
          result?.score || null,

        loading: false,

      });


    } catch (err) {

      console.error(
        "Wallet Analyze Error:",
        err
      );


      set({

        loading: false,

        error:
          err.message ||
          "Wallet analysis failed",

      });

    }

  },


  generateAIReport: async () => {

    const {
      wallet,
      data,
    } = get();


    if (!wallet || !data) {
      return;
    }


    set({

      aiLoading: true,
      error: null,

    });


    try {


      const result =
        await getAIWalletReport(wallet);


      set({

        aiReport: result,

        aiLoading: false,

      });


    } catch (err) {


      console.error(
        "AI Report Error:",
        err
      );


      set({

        aiLoading: false,

        error:
          err.message ||
          "AI report failed",

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