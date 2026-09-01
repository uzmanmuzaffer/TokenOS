import { getWalletTokens } from "../../services/alchemy.js";
import { getPublicWalletTokens } from "../../services/publicWallet.js";

export async function getEvmWallet(wallet, chain) {
  const chainId = chain.id;
  const chainName = chain.name;

  if (process.env.ALCHEMY_API_KEY) {
    try {
      const tokens = await getWalletTokens(wallet, chainId);

      return {
        success: true,
        chain: chainName,
        chainId,
        tokenCount: tokens.length,
        tokens,
        source: "alchemy",
      };
    } catch (error) {
      console.warn(
        `${chainName} Alchemy failed, using public fallback:`,
        error?.message
      );
    }
  }

  try {
    const tokens = await getPublicWalletTokens(wallet, chainId);

    return {
      success: true,
      chain: chainName,
      chainId,
      tokenCount: tokens.length,
      tokens,
      source: "public",
    };
  } catch (error) {
    console.error(`${chainName} wallet error:`, error?.message);

    return {
      success: false,
      chain: chainName,
      chainId,
      tokenCount: 0,
      tokens: [],
      error: error?.message || "Wallet provider error",
    };
  }
}