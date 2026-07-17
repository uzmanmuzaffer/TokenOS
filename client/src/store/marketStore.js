import { create } from "zustand";
import { getTokens } from "../services/api";

const useMarketStore = create((set) => ({
  tokens: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchTokens: async () => {
    set({
      loading: true,
      error: null,
    });

    try {
      const result = await getTokens();

      set({
        tokens: result || [],
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Failed to load market data",
      });
    }
  },

  clearTokens: () =>
    set({
      tokens: [],
      error: null,
      lastUpdated: null,
    }),
}));

export default useMarketStore;