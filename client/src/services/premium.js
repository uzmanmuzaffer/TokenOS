import axios from "axios";

const premiumApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function generatePremiumReport(wallet) {
  const { data } = await premiumApi.post("/api/premium/ai-report", {
    wallet,
  });

  return data;
}

export default premiumApi;