import { getWalletTokens } from "../../services/moralis.js";

/**
 * TokenOS EVM Provider
 *
 * Tüm EVM tabanlı ağlar için ortak provider.
 * Yeni EVM ağı eklemek için sadece config/chains.js dosyasına
 * yeni bir chain eklemek yeterlidir.
 */

export async function getEvmWallet(wallet, chain) {
  try {
    const tokens = await getWalletTokens(wallet, chain.id);

    return {
      success: true,
      chain: chain.name,
      chainId: chain.id,
      tokenCount: tokens.length,
      tokens,
    };
  } catch (error) {
    return {
      success: false,
      chain: chain.name,
      chainId: chain.id,
      tokenCount: 0,
      tokens: [],
      error: error.message,
    };
  }
}