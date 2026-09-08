import { ARC_TESTNET } from "../../config/arc.js";

/**
 * TokenOS × Arc
 *
 * Read-only Arc Testnet provider.
 *
 * IMPORTANT:
 * - No private keys
 * - No transaction signing
 * - No transaction sending
 * - Reads Arc native USDC balance
 */

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function hexToBigInt(value) {
  try {
    return BigInt(value || "0x0");
  } catch {
    return 0n;
  }
}

function formatUnits(value, decimals = 18) {
  const amount = hexToBigInt(value);

  if (decimals === 0) {
    return amount.toString();
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionString = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");

  return `${whole}.${fractionString}`;
}

async function rpc(method, params = []) {
  const response = await fetch(
    ARC_TESTNET.rpcUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Arc RPC HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(
      data.error.message ||
        "Arc RPC request failed"
    );
  }

  return data.result;
}

/**
 * Get Arc Testnet wallet information.
 */
export async function getArcWallet(wallet) {
  if (!isValidAddress(wallet)) {
    return {
      success: false,
      chain: ARC_TESTNET.name,
      chainId: ARC_TESTNET.id,
      tokenCount: 0,
      tokens: [],
      error: "Invalid wallet address",
    };
  }

  try {
    const normalizedWallet =
      wallet.toLowerCase();

    const [
      nativeBalance,
      blockNumber,
      networkChainId,
    ] = await Promise.all([
      rpc("eth_getBalance", [
        normalizedWallet,
        "latest",
      ]),

      rpc("eth_blockNumber"),

      rpc("eth_chainId"),
    ]);

    const nativeBalance18 =
      formatUnits(
        nativeBalance,
        18
      );

    /*
     * Arc uses USDC as the native gas asset.
     *
     * RPC balance is represented with
     * 18 decimal precision internally.
     *
     * Keep the raw/internal value and expose
     * the human-readable USDC value separately.
     */
    const nativeUsdc =
      Number(nativeBalance18);

    return {
      success: true,

      chain:
        ARC_TESTNET.name,

      chainId:
        ARC_TESTNET.id,

      networkChainId:
        Number(
          hexToBigInt(
            networkChainId
          )
        ),

      wallet:
        normalizedWallet,

      tokenCount: 1,

      tokens: [
        {
          chain:
            ARC_TESTNET.id,

          chainId:
            ARC_TESTNET.id,

          token_address:
            ARC_TESTNET.usdcContract,

          address:
            ARC_TESTNET.usdcContract,

          name:
            "USD Coin",

          symbol:
            "USDC",

          decimals:
            ARC_TESTNET.usdcDecimals,

          balance_raw:
            nativeBalance,

          balance_formatted:
            nativeUsdc.toFixed(6),

          price: 1,

          usd_price: 1,

          usdValue:
            Number(
              nativeUsdc.toFixed(6)
            ),

          priceSource:
            "arc-native-usdc",

          valuationStatus:
            "priced",

          isNative: true,

          isUSDC: true,
        },
      ],

      blockNumber:
        Number(
          hexToBigInt(
            blockNumber
          )
        ),

      source:
        "arc-rpc",
    };
  } catch (error) {
    console.error(
      "Arc wallet provider error:",
      error?.message
    );

    return {
      success: false,

      chain:
        ARC_TESTNET.name,

      chainId:
        ARC_TESTNET.id,

      tokenCount: 0,

      tokens: [],

      error:
        error?.message ||
        "Arc wallet provider error",
    };
  }
}