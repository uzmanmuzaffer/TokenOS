
import express from "express";

const router = express.Router();

/* ========================================
   CONFIG
======================================== */

const RPC =
  process.env.BASE_RPC_URL ||
  "https://base-mainnet.g.alchemy.com/public";

const TOKEN =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/*
  Base public RPC eth_getLogs limit:
  maximum 100 blocks.

  We use 90 to stay safely below the limit.
*/
const BLOCK_RANGE = 50n;

/* ========================================
   RPC
======================================== */

async function rpc(method, params = []) {
  const response = await fetch(RPC, {
    method: "POST",

    headers: {
      "content-type": "application/json",
    },

    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `RPC HTTP ${response.status}`
    );
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(
      json.error.message ||
        "RPC error"
    );
  }

  return json.result;
}

/* ========================================
   HELPERS
======================================== */

function addressFromTopic(topic) {
  if (!topic) {
    return null;
  }

  return (
    "0x" +
    topic
      .slice(-40)
      .toLowerCase()
  );
}

function hexToBigInt(value) {
  return BigInt(
    value || "0x0"
  );
}

/* ========================================
   ONCHAIN ROUTE
======================================== */

router.get(
  "/onchain",
  async (req, res) => {
    try {
      console.log(
        "⛓️ TOS onchain scan..."
      );

      /* -------------------------------
         1. LATEST BLOCK
      ------------------------------- */

      const block =
        await rpc(
          "eth_blockNumber"
        );

      const latest =
        hexToBigInt(block);

      /* -------------------------------
         2. BLOCK RANGE
      ------------------------------- */

      const from =
        latest > BLOCK_RANGE
          ? latest - BLOCK_RANGE
          : 0n;

      console.log(
        "Latest block:",
        latest.toString()
      );

      console.log(
        "From block:",
        from.toString()
      );

      console.log(
        "Range:",
        (latest - from + 1n).toString()
      );

      /* -------------------------------
         3. TRANSFER LOGS
      ------------------------------- */

      const logs =
        await rpc(
          "eth_getLogs",
          [
            {
              address: TOKEN,

              fromBlock:
                "0x" +
                from.toString(16),

              toBlock:
                "0x" +
                latest.toString(16),

              topics: [
                TRANSFER_TOPIC,
              ],
            },
          ]
        );

      /* -------------------------------
         4. TRANSFERS
      ------------------------------- */

      const transfers =
        (logs || []).map(
          (log) => ({
            txHash:
              log.transactionHash,

            blockNumber:
              Number(
                hexToBigInt(
                  log.blockNumber
                )
              ),

            from:
              addressFromTopic(
                log.topics?.[1]
              ),

            to:
              addressFromTopic(
                log.topics?.[2]
              ),

            valueRaw:
              hexToBigInt(
                log.data
              ).toString(),
          })
        );

      /* -------------------------------
         5. OBSERVED HOLDERS
      ------------------------------- */

      const holders =
        new Set();

      const ZERO_ADDRESS =
        "0x0000000000000000000000000000000000000000";

      for (const tx of transfers) {
        if (
          tx.from &&
          tx.from !== ZERO_ADDRESS
        ) {
          holders.add(
            tx.from
          );
        }

        if (
          tx.to &&
          tx.to !== ZERO_ADDRESS
        ) {
          holders.add(
            tx.to
          );
        }
      }

      /* -------------------------------
         6. RESPONSE
      ------------------------------- */

      const result = {
        success: true,

        token: TOKEN,

        chain: "Base",

        chainId: 8453,

        latestBlock:
          latest.toString(),

        scannedFromBlock:
          from.toString(),

        scannedToBlock:
          latest.toString(),

        scannedBlocks:
          (
            latest -
            from +
            1n
          ).toString(),

        transfers,

        transferCount:
          transfers.length,

        observedAddresses:
          holders.size,

        source:
          "Base RPC",

        updatedAt:
          new Date().toISOString(),
      };

      console.log(
        "✅ TOS onchain scan complete"
      );

      console.log(
        "Transfers:",
        transfers.length
      );

      console.log(
        "Observed addresses:",
        holders.size
      );

      res.json(result);

    } catch (error) {
      console.error(
        "❌ TOS onchain error:",
        error
      );

      res.status(500).json({
        success: false,

        error:
          error?.message ||
          "TOS onchain data unavailable.",

        token: TOKEN,

        chain: "Base",

        chainId: 8453,

        source:
          "Base RPC",
      });
    }
  }
);

/* ========================================
   EXPORT
======================================== */

export default router;

