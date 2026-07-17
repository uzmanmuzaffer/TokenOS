import "dotenv/config";

import { paymentMiddleware } from "@x402/express";
import {
  x402ResourceServer,
  HTTPFacilitatorClient,
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";


console.log("X402 Middleware ENV:", {
  network: process.env.X402_NETWORK,
  payTo: process.env.X402_PAY_TO,
  facilitator: process.env.X402_FACILITATOR,
});


const facilitator = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR,
});


const server = new x402ResourceServer(facilitator);


// Base Sepolia / EVM network kaydı
server.register(
  process.env.X402_NETWORK,
  new ExactEvmScheme()
);


export const x402Middleware = paymentMiddleware(
  {
   "POST /api/premium/ai-report": { 
      accepts: {
        scheme: "exact",
        price: "$0.05",
        network: process.env.X402_NETWORK,
        payTo: process.env.X402_PAY_TO,
      },

      description: "Premium AI Wallet Report",

      mimeType: "application/json",
    },
  },

  server
);