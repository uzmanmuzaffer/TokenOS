import "dotenv/config";

import { paymentMiddleware } from "@x402/express";
import {
  x402ResourceServer,
  HTTPFacilitatorClient,
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

console.log("========== X402 INITIALIZING ==========");

const network =
  process.env.X402_NETWORK || "eip155:84532";

const payTo =
  process.env.X402_PAY_TO;

const facilitatorUrl =
  process.env.X402_FACILITATOR ||
  "https://x402.org/facilitator";

if (!payTo) {
  throw new Error("❌ X402_PAY_TO is missing in .env");
}

console.log("Network     :", network);
console.log("Pay To      :", payTo);
console.log("Facilitator :", facilitatorUrl);

const facilitator =
  new HTTPFacilitatorClient({
    url: facilitatorUrl,
  });

const x402Server =
  new x402ResourceServer(
    facilitator
  );

x402Server.register(
  network,
  new ExactEvmScheme()
);

const payment = paymentMiddleware(
  {
    "POST /api/premium/ai-report": {
      accepts: [
        {
          scheme: "exact",
          network,
          price: "$0.05",
          payTo,
        },
      ],
      description:
        "TokenOS Premium AI Wallet Report",
      mimeType:
        "application/json",
    },
  },
  x402Server
);

export const x402Middleware = async (
  req,
  res,
  next
) => {
  console.log("");
  console.log("========== X402 REQUEST ==========");
  console.log("METHOD       :", req.method);
  console.log("URL          :", req.url);
  console.log("ORIGINAL URL :", req.originalUrl);
  console.log("==================================");

  try {
    return await payment(req, res, next);
  } catch (err) {
    console.error("");
    console.error("========== X402 ERROR ==========");
    console.error(err);
    console.error("================================");

    return res.status(500).json({
      success: false,
      error: err.message || "X402 Payment Error",
    });
  }
};

console.log("");
console.log("====================================");
console.log("✅ X402 PAYMENT MIDDLEWARE READY");
console.log("Network :", network);
console.log("Pay To  :", payTo);
console.log("====================================");