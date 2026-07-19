import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";


export const metaMaskConnector = injected({
  target: "metaMask",
});


export const walletConnectConnector = walletConnect({

  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,

  showQrModal: true,

});


export const coinbaseConnector = coinbaseWallet({

  appName: "TokenOS",

});