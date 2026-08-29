
import axios from "axios";

const MORALIS_BASE_URL =
  "https://deep-index.moralis.io/api/v2.2";

const TIMEOUT = 15000;

/**
 * TokenOS On-Chain Airdrop Scanner
 *
 * Amaç:
 * - Wallet ERC20 transfer geçmişini kontrol eder.
 * - Airdrop database'indeki token contract'larıyla eşleştirir.
 * - Gerçek alınmış token transferlerini kanıtlar.
 *
 * Güvenlik:
 * - Private key istemez.
 * - Seed phrase istemez.
 * - Transaction göndermez.
 * - Wallet imzalamaz.
 */

function normalizeAddress(address) {
  if (!address) return null;

  const value = String(address).trim();

  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return null;
  }

  return value.toLowerCase();
}

function normalizeNumber(value) {
  const n = Number(value ?? 0);

  return Number.isFinite(n) ? n : 0;
}

function formatAmount(raw, decimals = 18) {
  const amount = normalizeNumber(raw);
  const d = normalizeNumber(decimals);

  if (d < 0 || d > 36) {
    return 0;
  }

  return amount / Math.pow(10, d);
}

function normalizeContract(address) {
  if (!address) return "";

  return String(address)
    .trim()
    .toLowerCase();
}

/**
 * Moralis ERC20 transfer geçmişini alır.
 */
async function getWalletTransfers(wallet, chain = "base") {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MORALIS_API_KEY not found."
    );
  }

  const response = await axios.get(
    `${MORALIS_BASE_URL}/${wallet}/erc20/transfers`,
    {
      params: {
        chain,
        limit: 100,
      },

      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },

      timeout: TIMEOUT,
    }
  );

  return Array.isArray(response.data?.result)
    ? response.data.result
    : [];
}

/**
 * Airdrop token contract'larını map'e dönüştürür.
 */
function buildAirdropTokenMap(airdrops = []) {
  const map = new Map();

  for (const airdrop of airdrops) {
    const contract =
      normalizeContract(
        airdrop?.token?.contract
      );

    if (!contract) {
      continue;
    }

    if (!map.has(contract)) {
      map.set(contract, []);
    }

    map.get(contract).push(airdrop);
  }

  return map;
}

/**
 * Transferin cüzdana giriş olup olmadığını kontrol eder.
 */
function isIncomingTransfer(
  transfer,
  wallet
) {
  const normalizedWallet =
    normalizeAddress(wallet);

  const to =
    normalizeAddress(
      transfer?.to_address
    );

  return (
    normalizedWallet &&
    to &&
    normalizedWallet === to
  );
}

/**
 * Transferi TokenOS standardına çevirir.
 */
function normalizeReceivedTransfer(
  transfer,
  airdrops,
  wallet
) {
  const decimals =
    normalizeNumber(
      transfer?.token_decimals ?? 18
    );

  const amount =
    formatAmount(
      transfer?.value,
      decimals
    );

  const price =
    normalizeNumber(
      airdrops[0]?.pricing?.usd
    );

  const usdValue =
    amount * price;

  return {
    wallet,

    status: "received",

    project:
      airdrops[0]?.project ||
      "Unknown",

    token: {
      symbol:
        transfer?.token_symbol ||
        airdrops[0]?.token?.symbol ||
        "UNKNOWN",

      contract:
        transfer?.address ||
        airdrops[0]?.token?.contract ||
        "",

      decimals,
    },

    amount,

    usdValue:
      Number(
        usdValue.toFixed(2)
      ),

    chain: "base",

    evidence: {
      type: "erc20_transfer",

      txHash:
        transfer?.transaction_hash ||
        null,

      blockNumber:
        transfer?.block_number ||
        null,

      blockTimestamp:
        transfer?.block_timestamp ||
        null,

      from:
        transfer?.from_address ||
        null,

      to:
        transfer?.to_address ||
        null,
    },

    airdropIds:
      airdrops.map(
        (item) => item.id
      ),

    verified:
      airdrops.some(
        (item) =>
          item.verified === true
      ),
  };
}

/**
 * Wallet'ı bilinen airdropların token transferleriyle karşılaştırır.
 */
export async function scanWalletReceivedAirdrops(
  wallet,
  airdrops = [],
  chain = "base"
) {
  const normalizedWallet =
    normalizeAddress(wallet);

  if (!normalizedWallet) {
    throw new Error(
      "Valid EVM wallet address is required."
    );
  }

  const tokenMap =
    buildAirdropTokenMap(
      airdrops
    );

  if (tokenMap.size === 0) {
    return {
      success: true,
      wallet: normalizedWallet,
      chain,
      transfersScanned: 0,
      received: [],
      summary: {
        received: 0,
        receivedUsd: 0,
      },
    };
  }

  console.log(
    `🔎 ${normalizedWallet} ERC20 transferleri taranıyor...`
  );

  const transfers =
    await getWalletTransfers(
      normalizedWallet,
      chain
    );

  console.log(
    `📡 ${transfers.length} ERC20 transfer bulundu`
  );

  const received = [];

  for (const transfer of transfers) {
    if (
      !isIncomingTransfer(
        transfer,
        normalizedWallet
      )
    ) {
      continue;
    }

    const contract =
      normalizeContract(
        transfer?.address
      );

    if (!contract) {
      continue;
    }

    const matchingAirdrops =
      tokenMap.get(contract);

    if (
      !matchingAirdrops ||
      matchingAirdrops.length === 0
    ) {
      continue;
    }

    const normalized =
      normalizeReceivedTransfer(
        transfer,
        matchingAirdrops,
        normalizedWallet
      );

    received.push(
      normalized
    );
  }

  /**
   * Aynı transaction + token için
   * duplicate kayıtları temizle.
   */
  const unique = new Map();

  for (const item of received) {
    const key =
      `${item.evidence.txHash}:${item.token.contract}:${item.amount}`;

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  const results =
    Array.from(
      unique.values()
    );

  const receivedUsd =
    results.reduce(
      (sum, item) =>
        sum +
        normalizeNumber(
          item.usdValue
        ),
      0
    );

  return {
    success: true,

    wallet:
      normalizedWallet,

    chain,

    transfersScanned:
      transfers.length,

    received:
      results,

    summary: {
      received:
        results.length,

      receivedUsd:
        Number(
          receivedUsd.toFixed(2)
        ),
    },
  };
}

