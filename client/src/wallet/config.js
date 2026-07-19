import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";

import {
  metaMaskConnector,
  walletConnectConnector,
  coinbaseConnector,
} from "./connectors";


export const config = createConfig({

  chains: [
    base,
    mainnet,
  ],


  connectors: [

    metaMaskConnector,

    walletConnectConnector,

    coinbaseConnector,

  ],


  transports: {

    [base.id]: http(),

    [mainnet.id]: http(),

  },

});