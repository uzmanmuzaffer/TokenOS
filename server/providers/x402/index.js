import "dotenv/config";

import { paymentMiddleware } from "@x402/express";
import {
  x402ResourceServer,
  HTTPFacilitatorClient,
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

console.log("========== X402 INITIALIZING ==========");

const network = process.env.X402_NETWORK || "eip155:8453";
const payTo = process.env.X402_PAY_TO;
const facilitatorUrl =
  process.env.X402_FACILITATOR || "https://facilitator.x402.rs";

let payment = null;

if (!payTo) {
  console.warn(
    "⚠️ X402 disabled: X402_PAY_TO is missing."
  );
} else {
  try {
    console.log("Network     :", network);
    console.log("Pay To      :", payTo);
    console.log("Facilitator :", facilitatorUrl);

    const facilitator = new HTTPFacilitatorClient({
      url: facilitatorUrl,
    });

    const x402Server = new x402ResourceServer(
      facilitator
    );

    x402Server.register(
      network,
      new ExactEvmScheme()
    );

    payment = paymentMiddleware(
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

    console.log(
      "✅ X402 PAYMENT MIDDLEWARE READY"
    );
  } catch (error) {
    console.error(
      "❌ X402 initialization failed:",
      error
    );

    payment = null;
  }
}

export const x402Middleware = async (
  req,
  res,
  next
) => {
  if (!payment) {
    return res.status(503).json({
      success: false,
      premium: false,
      error:
        "Premium payment service is temporarily unavailable.",
    });
  }

  try {
    return await payment(req, res, next);
  } catch (error) {
    console.error(
      "❌ X402 request error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "X402 Payment Error",
    });
  }
};

console.log(
  payment
    ? "🟢 X402 enabled"
    : "🟡 X402 disabled - API will continue running"
);