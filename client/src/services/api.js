const BASE_URL = "http://localhost:5000";

export async function getTokens() {
  try {
    const response = await fetch(`${BASE_URL}/api/tokens`);

    if (!response.ok) {
      throw new Error("Token verileri alınamadı");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}