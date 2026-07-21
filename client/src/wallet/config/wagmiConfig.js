import { createConfig, http } from "wagmi";

import { chains } from "./chains";
import { connectors } from "./connectors";

export const wagmiConfig = createConfig({
  chains,

  connectors,

  transports: {
    [chains[0].id]: http(),
    [chains[1].id]: http(),
  },

  ssr: false,

  multiInjectedProviderDiscovery: true,
});