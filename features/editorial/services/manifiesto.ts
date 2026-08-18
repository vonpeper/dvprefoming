import { Article } from "@/types/mock";
import { mockArticles } from "@/data/mock";
import { ManifiestoArticlePayload, adaptManifiestoArticle } from "../types";

/**
 * Editorial Service to communicate with the external Manifiesto 21 Blog Engine.
 * Implements strict fault tolerance, falling back to local mocks if API fails or is unconfigured.
 */
export async function getLatestArticles(): Promise<Article[]> {
  const isMockMode = process.env.EDITORIAL_DATA_MODE === "mock";
  
  if (isMockMode) {
    console.info("[EDITORIAL] Explicit mock data mode is active (EDITORIAL_DATA_MODE=mock). Serving mock articles.");
    return mockArticles;
  }

  const apiUrl = process.env.MANIFIESTO21_API_URL;
  const apiKey = process.env.MANIFIESTO21_API_KEY;
  const tenantId = process.env.MANIFIESTO21_TENANT_ID;

  // If unconfigured or placeholder, return empty array (honest empty state)
  if (!apiUrl || apiUrl.includes("example.com") || !apiKey || !tenantId) {
    console.warn("[EDITORIAL] API credentials are not configured or placeholder detected. Returning empty content.");
    return [];
  }

  try {
    const url = `${apiUrl}/articles?tenant=${tenantId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      next: {
        tags: ["editorial"],
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(`External API returned status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("External API returned invalid response format (not an array)");
    }

    return data.map((item: ManifiestoArticlePayload) => adaptManifiestoArticle(item));
  } catch (error) {
    console.error("[EDITORIAL] Connection error or API failure. Returning empty content:", error);
    return [];
  }
}
