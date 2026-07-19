import "dotenv/config";

import { paymentMiddleware } from "@x402/express";

import {
  x402ResourceServer,
  HTTPFacilitatorClient,
} from "@x402/core/server";

import { ExactEvmScheme } from "@x402/evm/exact/server";


console.log("🔥 Initializing X402");


const network =
  process.env.X402_NETWORK || "eip155:84532";


const payTo =
  process.env.X402_PAY_TO;


const facilitator =
  new HTTPFacilitatorClient({

    url:
      process.env.X402_FACILITATOR ||
      "https://x402.org/facilitator",

  });



const x402Server =
  new x402ResourceServer(
    facilitator
  );



x402Server.register(
  network,
  new ExactEvmScheme()
);



export const x402Middleware =
  paymentMiddleware(

    {

      "/api/premium/ai-report":

      {

        accepts:
        [
          {
            scheme:
              "exact",

            network,

            price:
              "$0.05",

            payTo,

          }
        ],


        description:
          "TokenOS Premium AI Wallet Report",


        mimeType:
          "application/json",

      }

    },


    x402Server

  );



console.log(
  "🔥 X402 PAYMENT MIDDLEWARE ACTIVE",
  {
    network,
    payTo
  }
);