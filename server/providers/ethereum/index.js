import { getWalletTokens } from "../../services/moralis.js";

/**
 * Ethereum Provider
 * Şimdilik mevcut Moralis servisini kullanıyor.
 * İleride Ethereum'a özel servisler buraya eklenecek.
 */
export async function getEthereumWallet(wallet) {
  try {
    const tokens = await getWalletTokens(wallet, "eth");

    return {
      chain: "Ethereum",
      tokenCount: tokens.length,
      tokens,
    };
  } catch (error) {
    throw new Error(`Ethereum Provider: ${error.message}`);
  }
}