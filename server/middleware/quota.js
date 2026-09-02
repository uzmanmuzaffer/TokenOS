import {
  consumeQuota,
  getOrCreateAccount,
  normalizeAccountId,
  resolveApiKey,
} from "../services/billingService.js";

export function extractAccountId(req) {
  const headerAccount =
    req.header("x-tokenos-account") ||
    req.header("x-user-email") ||
    req.body?.accountId ||
    req.query?.accountId;

  if (headerAccount) return normalizeAccountId(headerAccount);

  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return normalizeAccountId(forwarded || req.ip || "anon");
}

export function requireQuota(metric) {
  return async function quotaMiddleware(req, res, next) {
    try {
      const apiToken = (req.header("authorization") || "").replace(
        /^Bearer\s+/i,
        ""
      );
      let accountId = extractAccountId(req);
      let usedMetric = metric;

      if (apiToken.startsWith("tos_")) {
        const account = await resolveApiKey(apiToken);
        if (!account) {
          return res.status(401).json({
            success: false,
            error: "Invalid API key.",
          });
        }
        accountId = account.id;
        req.apiAccount = account;
        if (metric === "scans") usedMetric = "apiRequests";
      }

      await getOrCreateAccount(accountId, {
        referredBy: req.query?.ref || req.body?.ref || null,
      });

      const quota = await consumeQuota(accountId, usedMetric);
      req.quota = quota;
      req.accountId = accountId;

      if (!quota.ok) {
        return res.status(402).json({
          success: false,
          error: quota.message,
          code: quota.code,
          quota,
          upgradeUrl: "/pricing",
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || "Quota check failed.",
      });
    }
  };
}