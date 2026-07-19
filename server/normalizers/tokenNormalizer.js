// server/normalizers/tokenNormalizer.js

export function normalizeToken(token, chain) {
  return {
    chain,

    address: token.token_address || "",

    symbol: token.symbol || "UNKNOWN",

    name: token.name || "Unknown Token",

    decimals: Number(token.decimals || 18),

    balance: Number(token.balance_formatted || 0),

    price: Number(token.usd_price || 0),

    value:
      Number(token.balance_formatted || 0) *
      Number(token.usd_price || 0),

    logo: token.logo || null,

    verified: true,
  };
}