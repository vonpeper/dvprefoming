import { Article } from "@/types/mock";
import { getStoredArticles } from "@/lib/storage";
import { ManifiestoArticlePayload, adaptManifiestoArticle } from "../types";

/**
 * Editorial Service to retrieve latest articles for the homepage and news feed.
 * Prioritizes dynamic local CMS storage (.data/articles.json) and ensures
 * strict chronological sorting (newest to oldest).
 */
export async function getLatestArticles(limit = 5): Promise<Article[]> {
  // Local CMS Storage (.data/articles.json) takes priority
  const localArticles = getStoredArticles();
  const published = localArticles.filter((a) => (a.status || "PUBLISHED") === "PUBLISHED");

  if (published.length > 0) {
    return published
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);
  }

  const apiUrl = process.env.MANIFIESTO21_API_URL;
  const apiKey = process.env.MANIFIESTO21_API_KEY;
  const tenantId = process.env.MANIFIESTO21_TENANT_ID;

  // If external API is configured, attempt to fetch from external Manifiesto API as fallback
  if (apiUrl && !apiUrl.includes("example.com") && apiKey && tenantId) {
    try {
      const url = `${apiUrl}/articles?tenant=${tenantId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        next: {
          tags: ["editorial"],
          revalidate: 0,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const adapted = data.map((item: ManifiestoArticlePayload) => adaptManifiestoArticle(item));
          return adapted
            .filter((a) => (a.status || "PUBLISHED") === "PUBLISHED")
            .sort((a, b) => {
              const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
              const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
              return timeB - timeA;
            })
            .slice(0, limit);
        }
      }
    } catch (error) {
      console.warn("[EDITORIAL] External API unreachable, falling back to local storage:", error);
    }
  }

  return [];
}
