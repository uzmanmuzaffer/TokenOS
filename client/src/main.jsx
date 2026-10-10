
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";

import "./index.css";
import App from "./App";
import { wagmiConfig } from "./wallet/config/wagmiConfig.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <App />
    </WagmiProvider>
  </StrictMode>
);
