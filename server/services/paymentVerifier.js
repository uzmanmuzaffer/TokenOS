import {
  createPublicClient,
  http,
  parseAbiItem,
} from "viem";

import { base } from "viem/chains";


const client = createPublicClient({

  chain: base,

  transport: http(
    process.env.BASE_RPC
  ),

});


const USDC_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";


const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);



export async function verifyPayment(txHash) {

  try {


    const receipt =
      await client.getTransactionReceipt({

        hash: txHash,

      });



    if (
      receipt.status !== "success"
    ) {

      return false;

    }



    const logs =
      await client.getLogs({

        address: USDC_ADDRESS,

        event: transferEvent,

        fromBlock: receipt.blockNumber,

        toBlock: receipt.blockNumber,

      });



    const payment =
      logs.find(

        (log) =>

          log.args.to?.toLowerCase() ===
          process.env.PREMIUM_WALLET.toLowerCase()

      );



    if (!payment) {

      return false;

    }



    const amount =
      Number(payment.args.value) / 1000000;



    const requiredAmount =
      Number(
        process.env.PREMIUM_PRICE_USDC || 0.5
      );



    if (
      amount < requiredAmount
    ) {

      return false;

    }



    return true;



  } catch(error) {


    console.error(
      "Payment verification error:",
      error
    );


    return false;

  }

}