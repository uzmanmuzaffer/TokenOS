import axios from "axios";

const MAX_TOKENS = 80;

const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

const EXPLORERS = {
  eth: "https://eth.blockscout.com",
  polygon: "https://polygon.blockscout.com",
  optimism: "https://optimism.blockscout.com",
  arbitrum: "https://arbitrum.blockscout.com",
  base: "https://base.blockscout.com",
  bsc: "https://bsc.blockscout.com",
};

const PUBLIC_RPC = {
  eth: "https://ethereum.publicnode.com",
  base: "https://mainnet.base.org",
  polygon: "https://polygon-bor.publicnode.com",
  bsc: "https://bsc.publicnode.com",
  arbitrum: "https://arbitrum-one.publicnode.com",
  optimism: "https://optimism.publicnode.com",
};

const NATIVE_TOKEN = {
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
  },
  base: {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
  },
  polygon: {
    name: "Polygon",
    symbol: "POL",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
  },
  bsc: {
    name: "BNB",
    symbol: "BNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    decimals: 18,
  },
  arbitrum: {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
  },
  optimism: {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
  },
};

function normalizeAddress(address) {
  return String(address || "").trim().toLowerCase();
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatBalance(raw, decimals) {
  try {
    const value = Number(raw) / Math.pow(10, decimals);
    return Number.isFinite(value) ? Number(value.toFixed(8)) : 0;
  } catch {
    return 0;
  }
}

function toTokenShape({
  address,
  name,
  symbol,
  logo,
  decimals,
  rawBalance,
  chain,
}) {
  const safeDecimals = Math.max(0, Math.min(36, safeNumber(decimals, 18)));
  const raw = String(rawBalance || "0");
  const formatted = formatBalance(raw, safeDecimals);
  const tokenAddress = normalizeAddress(address);

  return {
    token_address: address,
    name: name || "Unknown Token",
    symbol: symbol || "UNKNOWN",
    logo: logo || null,
    decimals: safeDecimals,
    balance: raw,
    balance_raw: raw,
    balance_formatted: formatted,
    chain,
    chainId: chain,
    isTokenOS: tokenAddress === TOS_CONTRACT,
    possible_spam: false,
    is_spam: false,
    price: 0,
    usd_price: 0,
    usdValue: 0,
    priceSource: "pending",
    valuationStatus: "pending",
  };
}

async function rpcBalance(chain, wallet) {
  const url = PUBLIC_RPC[chain];
  if (!url) return 0n;

  const { data } = await axios.post(
    url,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [wallet, "latest"],
    },
    {
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    }
  );

  if (data?.error) {
    throw new Error(data.error.message || "RPC error");
  }

  return BigInt(data?.result || "0x0");
}

async function getNativeToken(chain, wallet) {
  const meta = NATIVE_TOKEN[chain];
  if (!meta) return null;

  try {
    const raw = await rpcBalance(chain, wallet);
    if (raw <= 0n) return null;

    return toTokenShape({
      address: meta.address,
      name: meta.name,
      symbol: meta.symbol,
      logo: null,
      decimals: meta.decimals,
      rawBalance: raw.toString(),
      chain,
    });
  } catch (error) {
    console.warn(`Public native balance failed ${chain}:`, error.message);
    return null;
  }
}

async function getBlockscoutTokens(chain, wallet) {
  const base = EXPLORERS[chain];
  if (!base) return [];

  try {
    const { data } = await axios.get(
      `${base}/api/v2/addresses/${wallet}/token-balances`,
      {
        timeout: 20000,
        maxRedirects: 5,
        headers: { Accept: "application/json" },
      }
    );

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((item) => {
        const type = String(item?.token?.type || "ERC-20").toUpperCase();
        return type.includes("ERC-20") || type === "ERC20";
      })
      .map((item) => {
        const token = item.token || {};
        return toTokenShape({
          address: token.address_hash || token.address,
          name: token.name,
          symbol: token.symbol,
          logo: token.icon_url,
          decimals: token.decimals,
          rawBalance: item.value || "0",
          chain,
        });
      })
      .filter((token) => Number(token.balance_formatted) > 0);
  } catch (error) {
    console.warn(`Blockscout ${chain} failed:`, error.message);
    return [];
  }
}

export async function getPublicWalletTokens(wallet, chain) {
  const normalizedChain = String(chain || "").toLowerCase();
  const address = String(wallet || "").trim();

  if (!address) {
    throw new Error("Wallet address is required");
  }

  const [tokens, native] = await Promise.all([
    getBlockscoutTokens(normalizedChain, address),
    getNativeToken(normalizedChain, address),
  ]);

  const merged = [];
  const seen = new Set();

  if (native) {
    merged.push(native);
    seen.add(normalizeAddress(native.token_address));
  }

  for (const token of tokens) {
    const key = normalizeAddress(token.token_address);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(token);
  }

  merged.sort((a, b) => {
    if (a.isTokenOS && !b.isTokenOS) return -1;
    if (!a.isTokenOS && b.isTokenOS) return 1;
    return Number(b.balance_formatted) - Number(a.balance_formatted);
  });

  const selected = merged.slice(0, MAX_TOKENS);

  if (selected.length === 0) {
    throw new Error(`No public balances found on ${normalizedChain}`);
  }

  return selected;
}