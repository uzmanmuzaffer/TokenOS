
import axios from "axios";

const DEFILLAMA_AIRDROP_URL =
  "https://defillama.com/airdrop-directory";

const TIMEOUT = 15000;

/**
 * TokenOS DeFiLlama Airdrop Discovery
 *
 * Discovery katmanı:
 * - DeFiLlama Airdrop Directory sayfasını tarar
 * - Airdrop ile ilişkili bağlantıları yakalar
 * - TokenOS standardına dönüştürür
 *
 * ÖNEMLİ:
 * Bu kaynak tek başına wallet eligibility kanıtı değildir.
 */

function decodeHtml(value = "") {
  return String(value)
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x60;/gi, "`")
    .replace(/&#96;/gi, "`");
}

function cleanText(value = "") {
  return decodeHtml(
    String(value)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractLinks(html) {
  const links = [];

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const text = cleanText(match[2]);

    if (!href) {
      continue;
    }

    links.push({
      href,
      text,
    });
  }

  return links;
}

function makeAbsoluteUrl(url) {
  if (!url) {
    return null;
  }

  const value = String(url).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("/")) {
    return `https://defillama.com${value}`;
  }

  return `https://defillama.com/${value}`;
}

function looksLikeAirdropLink(link) {
  const text =
    String(link?.text || "").toLowerCase();

  const href =
    String(link?.href || "").toLowerCase();

  return (
    text.includes("airdrop") ||
    href.includes("airdrop") ||
    href.includes("claim")
  );
}

function normalizeDiscoveredItem(
  item,
  index
) {
  const project =
    item?.text ||
    `Unknown Project ${index + 1}`;

  const url =
    makeAbsoluteUrl(item?.href);

  return {
    id:
      `defillama-${index + 1}`,

    project,

    token: {
      symbol: "UNKNOWN",
      contract: "",
      decimals: 18,
    },

    chains: [],

    allocation: {
      total: 0,
      claimed: 0,
      remaining: 0,
    },

    status: "potential",

    claim: {
      isLive: false,
      start: null,
      end: null,
      url,
    },

    eligibility: {
      type: "unknown",
      rules: [],
    },

    sources: [
      {
        name: "DeFiLlama",
        url: DEFILLAMA_AIRDROP_URL,
      },
    ],

    pricing: {
      usd: 0,
      source: null,
    },

    verified: false,

    lastVerified: null,

    discovery: {
      source: "defillama",
      url,
      rawName: project,
    },
  };
}

export async function discoverDeFiLlamaAirdrops() {
  try {
    console.log(
      "🔎 DeFiLlama Airdrop Directory taranıyor..."
    );

    const response =
      await axios.get(
        DEFILLAMA_AIRDROP_URL,
        {
          timeout: TIMEOUT,

          headers: {
            accept:
              "text/html,application/xhtml+xml",

            "user-agent":
              "Mozilla/5.0 TokenOS-Airdrop-Radar/1.0",
          },
        }
      );

    const html =
      String(response.data || "");

    console.log(
      `📄 DeFiLlama HTML: ${html.length} karakter`
    );

    const links =
      extractLinks(html);

    console.log(
      `🔗 ${links.length} bağlantı bulundu`
    );

    const candidates =
      links.filter(
        looksLikeAirdropLink
      );

    const unique =
      new Map();

    for (const item of candidates) {
      const url =
        makeAbsoluteUrl(item?.href);

      if (!url) {
        continue;
      }

      if (!unique.has(url)) {
        unique.set(
          url,
          item
        );
      }
    }

    const airdrops =
      Array.from(
        unique.values()
      )
        .slice(0, 200)
        .map(
          normalizeDiscoveredItem
        );

    console.log(
      `🎯 DeFiLlama adayları: ${airdrops.length}`
    );

    return {
      success: true,

      source: "defillama",

      sourceUrl:
        DEFILLAMA_AIRDROP_URL,

      discoveredAt:
        new Date().toISOString(),

      count:
        airdrops.length,

      airdrops,

      rawLength:
        html.length,
    };
  } catch (error) {
    console.error(
      "❌ DeFiLlama discovery error:",
      error?.message
    );

    return {
      success: false,

      source: "defillama",

      sourceUrl:
        DEFILLAMA_AIRDROP_URL,

      discoveredAt:
        new Date().toISOString(),

      count: 0,

      airdrops: [],

      error:
        error?.message ||
        "DeFiLlama request failed.",
    };
  }
}

