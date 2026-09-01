
import { getWalletTokens } from "../../services/alchemy.js";

/**
 * TokenOS EVM Provider
 *
 * Wallet Analyzer için Moralis yerine
 * Alchemy Token API kullanılır.
 */

export async function getEvmWallet(
  wallet,
  chain
) {
  try {
    const tokens =
      await getWalletTokens(
        wallet,
        chain.id
      );

    return {
      success: true,

      chain:
        chain.name,

      chainId:
        chain.id,

      tokenCount:
        tokens.length,

      tokens,
    };
  } catch (error) {
    console.error(
      `❌ ${chain.name} wallet error:`,
      error?.message
    );

    return {
      success: false,

      chain:
        chain.name,

      chainId:
        chain.id,

      tokenCount: 0,

      tokens: [],

      error:
        error?.message ||
        "Wallet provider error",
    };
  }
}

