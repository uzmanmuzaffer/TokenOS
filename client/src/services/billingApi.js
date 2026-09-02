const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function accountHeaders() {
  const account =
    window.localStorage.getItem("tokenos_account") ||
    window.localStorage.getItem("tokenos_email") ||
    "";
  const apiKey = window.localStorage.getItem("tokenos_api_key") || "";
  const headers = { "Content-Type": "application/json" };
  if (account) headers["x-tokenos-account"] = account;
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...accountHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

export function setBillingAccount(email) {
  if (email) {
    window.localStorage.setItem("tokenos_account", email.trim().toLowerCase());
  }
}

export const billingApi = {
  catalog: () => request("/api/billing/catalog"),
  account: () => request("/api/billing/account"),
  checkout: (planId, paymentRef) =>
    request("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({
        planId,
        paymentRef,
        ref: window.localStorage.getItem("tokenos_ref"),
      }),
    }),
  createApiKey: (label) =>
    request("/api/billing/api-keys", {
      method: "POST",
      body: JSON.stringify({ label }),
    }),
  referrals: () => request("/api/billing/referrals"),
};