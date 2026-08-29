
import express from "express";

import {
  refreshAirdropDatabase,
} from "../airdrop/discoveryManager.js";

import {
  scanWalletForAirdrops,
} from "../airdrop/airdropEngine.js";

import {
  getAirdropDatabaseStats,
  getAllAirdrops,
} from "../airdrop/airdropDatabase.js";

import {
  scanWalletReceivedAirdrops,
} from "../airdrop/onchainAirdropScanner.js";

const router = express.Router();

// ========================================
// DATABASE REFRESH
// ========================================

router.get("/refresh", async (req, res) => {
  try {
    const airdrops =
      await refreshAirdropDatabase();

    res.json({
      success: true,
      count: airdrops.length,
      airdrops,
    });
  } catch (error) {
    console.error(
      "Airdrop refresh error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Airdrop discovery failed.",
    });
  }
});

// ========================================
// ALL AIRDROPS
// ========================================

router.get("/", (req, res) => {
  const airdrops =
    getAllAirdrops();

  res.json({
    success: true,
    count: airdrops.length,
    stats:
      getAirdropDatabaseStats(),
    airdrops,
  });
});

// ========================================
// DATABASE STATS
// ========================================

router.get("/stats", (req, res) => {
  res.json({
    success: true,
    stats:
      getAirdropDatabaseStats(),
  });
});

// ========================================
// WALLET AIRDROP SCANNER
// ========================================

router.post("/scan", async (req, res) => {
  try {
    const {
      wallet,
      transactionCount = 0,
      protocolCount = 0,
      chains = [],
    } = req.body || {};

    if (!wallet) {
      return res.status(400).json({
        success: false,
        error:
          "Wallet address is required.",
      });
    }

    // ====================================
    // DATABASE
    // ====================================

    if (
      getAllAirdrops().length === 0
    ) {
      console.log(
        "📦 Airdrop database boş. Discovery başlatılıyor..."
      );

      await refreshAirdropDatabase();
    }

    const airdrops =
      getAllAirdrops();

    console.log("");
    console.log(
      "===================================="
    );
    console.log(
      "🎁 TokenOS Wallet Airdrop Scan"
    );
    console.log(
      "===================================="
    );
    console.log(
      "Wallet:",
      wallet
    );
    console.log(
      "Airdrops:",
      airdrops.length
    );

    // ====================================
    // 1. ELIGIBILITY ENGINE
    // ====================================

    const walletData = {
      wallet,
      transactionCount,
      protocolCount,
      chains,
    };

    const eligibilityResult =
      scanWalletForAirdrops(
        walletData
      );

    // ====================================
    // 2. ON-CHAIN RECEIVED SCANNER
    // ====================================

    let receivedResult = {
      success: false,
      wallet,
      chain: "base",
      transfersScanned: 0,
      received: [],
      summary: {
        received: 0,
        receivedUsd: 0,
      },
    };

    try {
      receivedResult =
        await scanWalletReceivedAirdrops(
          wallet,
          airdrops,
          "base"
        );

      console.log(
        `✅ Received airdrops: ${receivedResult.summary.received}`
      );

      console.log(
        `💰 Received USD: $${receivedResult.summary.receivedUsd}`
      );
    } catch (error) {
      console.error(
        "⚠️ On-chain scanner error:",
        error.message
      );

      receivedResult = {
        success: false,
        wallet,
        chain: "base",
        transfersScanned: 0,
        received: [],
        summary: {
          received: 0,
          receivedUsd: 0,
        },
        error:
          error.message,
      };
    }

    // ====================================
    // 3. MERGE RESULTS
    // ====================================

    const received =
      receivedResult.received || [];

    const receivedProjects =
      new Set(
        received.map(
          (item) =>
            `${item.project}:${item.token.contract}`
              .toLowerCase()
        )
      );

    const mergedResults =
      eligibilityResult.results.map(
        (item) => {
          const contract =
            item.token?.contract
              ?.toLowerCase();

          const key =
            `${item.project}:${contract}`
              .toLowerCase();

          const receivedMatches =
            received.filter(
              (r) =>
                r.project ===
                  item.project &&
                r.token?.contract
                  ?.toLowerCase() ===
                  contract
            );

          if (
            receivedMatches.length === 0
          ) {
            return item;
          }

          const totalReceived =
            receivedMatches.reduce(
              (sum, r) =>
                sum +
                Number(
                  r.amount || 0
                ),
              0
            );

          const totalReceivedUsd =
            receivedMatches.reduce(
              (sum, r) =>
                sum +
                Number(
                  r.usdValue || 0
                ),
              0
            );

          return {
            ...item,

            status: "received",

            received: {
              detected: true,

              amount:
                totalReceived,

              usdValue:
                Number(
                  totalReceivedUsd.toFixed(
                    2
                  )
                ),

              transfers:
                receivedMatches,
            },

            evidence: {
              type:
                "erc20_transfer",

              transactionCount:
                receivedMatches.length,

              transactions:
                receivedMatches.map(
                  (r) =>
                    r.evidence
                ),
            },
          };
        }
      );

    // ====================================
    // 4. RECEIVED SUMMARY
    // ====================================

    const receivedUsd =
      received.reduce(
        (sum, item) =>
          sum +
          Number(
            item.usdValue || 0
          ),
        0
      );

    const receivedAmount =
      received.length;

    // ====================================
    // 5. FINAL RESPONSE
    // ====================================

    console.log(
      "===================================="
    );

    return res.json({
      success: true,

      wallet,

      scannedAt:
        new Date().toISOString(),

      summary: {
        ...eligibilityResult.summary,

        received:
          receivedAmount,

        receivedUsd:
          Number(
            receivedUsd.toFixed(2)
          ),

        confirmedTotalUsd:
          Number(
            (
              Number(
                eligibilityResult.summary
                  ?.confirmedTotalUsd ||
                0
              ) +
              receivedUsd
            ).toFixed(2)
          ),
      },

      received: {
        success:
          receivedResult.success,

        chain:
          receivedResult.chain,

        transfersScanned:
          receivedResult.transfersScanned,

        count:
          received.length,

        usdValue:
          Number(
            receivedUsd.toFixed(2)
          ),

        results:
          received,
      },

      results:
        mergedResults,
    });
  } catch (error) {
    console.error(
      "Airdrop scan error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Airdrop scan failed.",
    });
  }
});

export default router;

