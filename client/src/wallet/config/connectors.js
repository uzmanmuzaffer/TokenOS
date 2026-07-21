import {
  injected,
  walletConnect,
  coinbaseWallet,
} from "wagmi/connectors";

import { APP_NAME } from "../constants/walletConstants";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn(
    "VITE_WALLETCONNECT_PROJECT_ID bulunamadı. WalletConnect devre dışı kalacaktır."
  );
}

export const connectors = [
  injected({
    shimDisconnect: true,
  }),

  walletConnect({
    projectId: projectId || "missing-project-id",
    showQrModal: true,
  }),

  coinbaseWallet({
    appName: APP_NAME,
  }),
];