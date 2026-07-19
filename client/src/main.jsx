import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import WalletProvider from "./wallet/WalletProvider";


createRoot(document.getElementById("root")).render(
  <StrictMode>

    <WalletProvider>

      <App />

    </WalletProvider>

  </StrictMode>
);