
import "dotenv/config";
import axios from "axios";

const ALCHEMY_API_KEY =
  process.env.ALCHEMY_API_KEY || "";

const MAX_TOKENS = 100;

const CHAIN_ENDPOINTS = {
  eth:
    "https://eth-mainnet.g.alchemy.com/v2/",

  base:
    "https://base-mainnet.g.alchemy.com/v2/",

  polygon:
    "https://polygon-mainnet.g.alchemy.com/v2/",

  arbitrum:
    "https://arb-mainnet.g.alchemy.com/v2/",

  optimism:
    "https://opt-mainnet.g.alchemy.com/v2/",

  bsc:
    "https://bnb-mainnet.g.alchemy.com/v2/",
};

const TOS_CONTRACT =
  "0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10".toLowerCase();

function getEndpoint(chain) {
  const base = CHAIN_ENDPOINTS[chain];

  if (!base) {
    throw new Error(
      `Unsupported Alchemy chain: ${chain}`
    );
  }

  if (!ALCHEMY_API_KEY) {
    throw new Error(
      "ALCHEMY_API_KEY not configured."
    );
  }

  return `${base}${ALCHEMY_API_KEY}`;
}

async function rpc(
  chain,
  method,
  params = []
) {
  const url = getEndpoint(chain);

  const response = await axios.post(
    url,
    {
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    },
    {
      timeout: 20000,
      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );

  if (response.data?.error) {
    throw new Error(
      response.data.error.message ||
        "Alchemy RPC error"
    );
  }

  return response.data?.result;
}

function safeNumber(
  value,
  fallback = 0
) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

function normalizeAddress(address) {
  return String(
    address || ""
  ).trim().toLowerCase();
}

function hexToBigInt(value) {
  try {
    return BigInt(
      value || "0x0"
    );
  } catch {
    return 0n;
  }
}

function formatBalance(
  raw,
  decimals
) {
  try {
    const value =
      Number(raw) /
      Math.pow(
        10,
        decimals
      );

    return Number(
      Number.isFinite(value)
        ? value.toFixed(8)
        : "0"
    );
  } catch {
    return 0;
  }
}

async function getMetadata(
  chain,
  address
) {
  try {
    const result =
      await rpc(
        chain,
        "alchemy_getTokenMetadata",
        [address]
      );

    return {
      name:
        result?.name ||
        "Unknown Token",

      symbol:
        result?.symbol ||
        "UNKNOWN",

      decimals:
        safeNumber(
          result?.decimals,
          18
        ),

      logo:
        result?.logo ||
        null,
    };
  } catch {
    return {
      name: "Unknown Token",
      symbol: "UNKNOWN",
      decimals: 18,
      logo: null,
    };
  }
}

function isPositiveBalance(
  balance
) {
  try {
    return (
      hexToBigInt(
        balance
      ) > 0n
    );
  } catch {
    return false;
  }
}

export async function getWalletTokens(
  wallet,
  chain = "base"
) {
  if (!wallet) {
    throw new Error(
      "Wallet address is required."
    );
  }

  const normalizedWallet =
    normalizeAddress(wallet);

  const normalizedChain =
    String(chain || "base")
      .trim()
      .toLowerCase();

  console.log(
    `🔵 Alchemy Wallet: ${normalizedChain}`
  );

  /*
   * Alchemy API key kontrolü.
   */
  if (!ALCHEMY_API_KEY) {
    throw new Error(
      "ALCHEMY_API_KEY not configured."
    );
  }

  /*
   * Wallet token balances.
   */
  const balances =
    await rpc(
      normalizedChain,
      "alchemy_getTokenBalances",
      [normalizedWallet]
    );

  const tokenBalances =
    Array.isArray(
      balances?.tokenBalances
    )
      ? balances.tokenBalances
      : [];

  console.log(
    `📦 Alchemy ${normalizedChain}: ${tokenBalances.length} token kayıt`
  );

  /*
   * Sadece gerçek bakiyesi olan tokenler.
   */
  const nonZero =
    tokenBalances.filter(
      (item) =>
        item?.contractAddress &&
        isPositiveBalance(
          item?.tokenBalance
        )
    );

  /*
   * TOS'u en üste taşı.
   */
  nonZero.sort(
    (a, b) => {
      const aTos =
        normalizeAddress(
          a.contractAddress
        ) === TOS_CONTRACT;

      const bTos =
        normalizeAddress(
          b.contractAddress
        ) === TOS_CONTRACT;

      if (aTos && !bTos) {
        return -1;
      }

      if (!aTos && bTos) {
        return 1;
      }

      return 0;
    }
  );

  const selected =
    nonZero.slice(
      0,
      MAX_TOKENS
    );

  /*
   * Metadata paralel çekilir.
   */
  const tokens =
    await Promise.all(
      selected.map(
        async (item) => {
          const address =
            item.contractAddress;

          const metadata =
            await getMetadata(
              normalizedChain,
              address
            );

          const decimals =
            Math.max(
              0,
              Math.min(
                36,
                safeNumber(
                  metadata.decimals,
                  18
                )
              )
            );

          const rawBalance =
            item.tokenBalance ||
            "0x0";

          const rawBigInt =
            hexToBigInt(
              rawBalance
            );

          const balance =
            formatBalance(
              rawBigInt.toString(),
              decimals
            );

          const isTokenOS =
            normalizeAddress(
              address
            ) === TOS_CONTRACT;

          return {
            token_address:
              address,

            name:
              metadata.name,

            symbol:
              metadata.symbol,

            logo:
              metadata.logo,

            decimals,

            balance:
              rawBigInt.toString(),

            balance_raw:
              rawBigInt.toString(),

            balance_formatted:
              balance,

            chain:
              normalizedChain,

            chainId:
              normalizedChain,

            isTokenOS,

            possible_spam:
              false,

            is_spam:
              false,

            /*
             * Fiyatlandırma
             * walletEngine tarafından
             * daha sonra yapılacak.
             */
            price: 0,

            usd_price: 0,

            usdValue: 0,

            priceSource:
              "pending",

            valuationStatus:
              "pending",
          };
        }
      )
    );

  console.log(
    `🟢 ${normalizedChain}: ${tokens.length} gerçek token`
  );

  const tos =
    tokens.find(
      (token) =>
        token.isTokenOS
    );

  if (tos) {
    console.log(
      "🟢 TOS bulundu:",
      tos.token_address
    );
  }

  return tokens;
}

