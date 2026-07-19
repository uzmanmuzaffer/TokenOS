import { WagmiProvider } from "wagmi";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { config } from "./config";


const queryClient = new QueryClient({
  defaultOptions: {

    queries: {

      retry: false,

      refetchOnWindowFocus: false,

    },

  },

});


function WalletProvider({ children }) {

  return (

    <WagmiProvider config={config}>

      <QueryClientProvider client={queryClient}>

        {children}

      </QueryClientProvider>

    </WagmiProvider>

  );

}


export default WalletProvider;