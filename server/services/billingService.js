import crypto from "node:crypto";
import {
  ADD_ONS,
  REFERRAL_COMMISSION_RATE,
  getPlan,
  listPublicPlans,
} from "../config/plans.js";
import { readStore, updateStore } from "./store.js";

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function defaultUsage() {
  return {
    day: dayKey(),
    month: monthKey(),
    scans: 0,
    aiBriefs: 0,
    airdropScans: 0,
    apiRequests: 0,
  };
}

function resetUsageIfNeeded(usage = defaultUsage()) {
  const next = { ...defaultUsage(), ...usage };
  if (next.day !== dayKey()) {
    next.day = dayKey();
    next.scans = 0;
    next.aiBriefs = 0;
    next.airdropScans = 0;
  }
  if (next.month !== monthKey()) {
    next.month = monthKey();
    next.apiRequests = 0;
  }
  return next;
}

function normalizeAccountId(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "anon";
  return value.slice(0, 120);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export { normalizeAccountId };

export async function getOrCreateAccount(accountId, extras = {}) {
  const id = normalizeAccountId(accountId);
  let created = null;

  await updateStore((state) => {
    if (!state.accounts[id]) {
      state.accounts[id] = {
        id,
        planId: "free",
        status: "active",
        referralCode: makeId("ref").slice(4, 12),
        referredBy: extras.referredBy || null,
        createdAt: new Date().toISOString(),
        usage: defaultUsage(),
        apiKeyIds: [],
      };
    }
    created = state.accounts[id];
    if (
      extras.referredBy &&
      !created.referredBy &&
      extras.referredBy !== created.referralCode
    ) {
      created.referredBy = extras.referredBy;
    }
  });

  return created;
}

export async function getAccountSnapshot(accountId) {
  const account = await getOrCreateAccount(accountId);
  const plan = getPlan(account.planId);
  const usage = resetUsageIfNeeded(account.usage);
  return { account: { ...account, usage }, plan };
}

export async function consumeQuota(accountId, metric) {
  const snapshot = await getAccountSnapshot(accountId);
  const { account, plan } = snapshot;
  const usage = resetUsageIfNeeded(account.usage);

  const limitMap = {
    scans: plan.limits.scansPerDay,
    aiBriefs: plan.limits.aiBriefsPerDay,
    airdropScans: plan.limits.airdropScansPerDay,
    apiRequests: plan.limits.apiRequestsPerMonth,
  };

  const limit = Number(limitMap[metric] ?? 0);
  const used = Number(usage[metric] ?? 0);

  if (limit === 0 && metric === "apiRequests") {
    return {
      ok: false,
      code: "PLAN_REQUIRED",
      message: "API access is included on Research Desk.",
      used,
      limit,
      planId: plan.id,
    };
  }

  if (used >= limit) {
    return {
      ok: false,
      code: "QUOTA_EXCEEDED",
      message: `${plan.name} ${metric} quota reached (${limit}).`,
      used,
      limit,
      planId: plan.id,
      upgrade: plan.id === "free" ? "pro" : "desk",
    };
  }

  usage[metric] = used + 1;

  await updateStore((state) => {
    if (state.accounts[account.id]) {
      state.accounts[account.id].usage = usage;
    }
  });

  return {
    ok: true,
    used: usage[metric],
    limit,
    remaining: Math.max(limit - usage[metric], 0),
    planId: plan.id,
  };
}

export async function changePlan(accountId, planId, paymentRef = null) {
  if (!["free", "pro", "desk"].includes(planId)) {
    throw new Error("Unknown plan.");
  }

  const plan = getPlan(planId);
  const account = await getOrCreateAccount(accountId);
  const invoice = {
    id: makeId("inv"),
    accountId: account.id,
    planId,
    amountUsd: plan.priceUsd,
    currency: "USDC",
    status: plan.priceUsd === 0 ? "comped" : "marked_paid",
    paymentRef,
    createdAt: new Date().toISOString(),
  };

  await updateStore((state) => {
    state.accounts[account.id].planId = planId;
    state.accounts[account.id].status = "active";
    state.accounts[account.id].updatedAt = invoice.createdAt;
    state.invoices.push(invoice);

    if (plan.priceUsd > 0 && account.referredBy) {
      const referrer = Object.values(state.accounts).find(
        (item) => item.referralCode === account.referredBy
      );
      if (referrer) {
        const commission = Number(
          (plan.priceUsd * REFERRAL_COMMISSION_RATE).toFixed(2)
        );
        state.referrals[referrer.id] ||= { earnedUsd: 0, events: [] };
        state.referrals[referrer.id].earnedUsd += commission;
        state.referrals[referrer.id].events.push({
          from: account.id,
          invoiceId: invoice.id,
          commissionUsd: commission,
          at: invoice.createdAt,
        });
      }
    }
  });

  return { plan, invoice };
}

export async function issueApiKey(accountId, label = "default") {
  const { account, plan } = await getAccountSnapshot(accountId);
  if (!plan.limits.apiRequestsPerMonth) {
    const error = new Error("Upgrade to Research Desk to create an API key.");
    error.status = 402;
    throw error;
  }

  const token = `tos_${crypto.randomBytes(18).toString("hex")}`;
  const keyId = makeId("key");
  const record = {
    id: keyId,
    accountId: account.id,
    label,
    tokenHash: hashToken(token),
    prefix: token.slice(0, 10),
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };

  await updateStore((state) => {
    state.apiKeys[keyId] = record;
    state.accounts[account.id].apiKeyIds = [
      ...(state.accounts[account.id].apiKeyIds || []),
      keyId,
    ];
  });

  return { keyId, token, prefix: record.prefix, label };
}

export async function resolveApiKey(token) {
  if (!token) return null;
  const hash = hashToken(token);
  const state = await readStore();
  const match = Object.values(state.apiKeys).find(
    (item) => item.tokenHash === hash && !item.revokedAt
  );
  if (!match) return null;
  return state.accounts[match.accountId] || null;
}

export async function listApiKeys(accountId) {
  const state = await readStore();
  const account = state.accounts[normalizeAccountId(accountId)];
  if (!account) return [];
  return (account.apiKeyIds || [])
    .map((id) => state.apiKeys[id])
    .filter(Boolean)
    .map(({ tokenHash, ...rest }) => rest);
}

export async function getReferralStats(accountId) {
  const { account } = await getAccountSnapshot(accountId);
  const state = await readStore();
  const stats = state.referrals[account.id] || { earnedUsd: 0, events: [] };
  return {
    code: account.referralCode,
    commissionRate: REFERRAL_COMMISSION_RATE,
    earnedUsd: stats.earnedUsd,
    events: stats.events.slice(-25).reverse(),
  };
}

export function publicCatalog() {
  return {
    plans: listPublicPlans(),
    addOns: Object.values(ADD_ONS),
    notes: [
      "Subscriptions are billed in USDC on Base.",
      "Free tier never requires a deposit.",
      "TokenOS does not pay yield, staking rewards or guaranteed airdrops.",
      "Referral payout is 20% of the first paid month of a referred account.",
    ],
  };
}