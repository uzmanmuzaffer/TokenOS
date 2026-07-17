import { create } from "zustand";

import { getNews } from "../services/api";


const useNewsStore = create((set) => ({

  news: [],

  loading: false,

  error: null,

  lastUpdated: null,


  fetchNews: async () => {

    set({
      loading: true,
      error: null,
    });


    try {

      const result = await getNews();


      set({

        news: result || [],

        loading: false,

        lastUpdated: new Date(),

      });


    } catch(error) {


      set({

        loading: false,

        error:
          error.message ||
          "Failed to load news",

      });


    }

  },


  clearNews: () =>

    set({

      news: [],

      error: null,

      lastUpdated: null,

    }),


}));


export default useNewsStore;