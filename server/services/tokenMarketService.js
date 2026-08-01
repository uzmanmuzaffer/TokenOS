import { getTokenInfo } from "./token.js";
import { getTokenMarket } from "../providers/dexscreener/index.js";

export async function getDashboardData() {
  try {
    const [token, market] = await Promise.all([
      getTokenInfo(),
      getTokenMarket(),
    ]);

    return {
      success: true,

      token: {
        name: token.name,
        symbol: token.symbol,
        contract: token.contract,
        network: token.network,
        verified: token.verified,
        totalSupply: token.totalSupply,
        formattedSupply: token.formattedSupply,
        securityScore: token.securityScore,
      },

      market: {
        price: market?.priceUsd ?? 0,
        liquidity: market?.liquidity ?? 0,
        volume24h: market?.volume24h ?? 0,

        // DexScreener döndürüyorsa kullan
        fdv: market?.fdv ?? 0,

        // Yoksa null bırak
        marketCap: market?.marketCap ?? null,

        dex: market?.dex ?? "-",
        pair: market?.pairName ?? "-",
        pairAddress: market?.pairAddress ?? "",
        chart: market?.url ?? "",
      },

      analytics: {
        holders: 0,
        circulatingSupply: null,
        aiScore: null,
        risk: "Unknown",
      },

      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[TokenMarketService]", error);

    return {
      success: false,
      message: error.message,
    };
  }
}