import {
  injected,
  walletConnect,
  coinbaseWallet,
} from "wagmi/connectors";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const metaMaskConnector = injected();

export const walletConnectConnector = walletConnect({
  projectId,
  showQrModal: true,
});

export const coinbaseConnector = coinbaseWallet({
  appName: "TokenOS",
});