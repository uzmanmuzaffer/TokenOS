/**
 * TokenOS × Arc
 * Arc Testnet configuration
 *
 * Arc uses USDC as the native gas asset.
 */

export const ARC_TESTNET = {
  id: "arc",
  name: "Arc Testnet",
  type: "arc",

  chainId: 5042002,

  rpcUrl:
    process.env.ARC_TESTNET_RPC ||
    "https://rpc.testnet.arc.network",

  explorerUrl:
    "https://testnet.arcscan.app",

  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
    displayDecimals: 6,
  },

  usdcContract:
    "0x3600000000000000000000000000000000000000",

  usdcDecimals: 6,

  confirmationsRequired: 1,
};

export const ARC_CONFIG = {
  testnet: ARC_TESTNET,
};