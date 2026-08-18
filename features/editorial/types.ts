import { Article, EntityStatus } from "@/types/mock";

export interface ManifiestoArticlePayload {
  id: string;
  slug: string;
  title: string;
  body_markdown: string;
  summary: string;
  author: {
    name: string;
  };
  published_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Adapter to transform raw external Manifiesto 21 payloads into 
 * internal Article types, ensuring decoupling and data safety.
 */
export function adaptManifiestoArticle(payload: ManifiestoArticlePayload): Article {
  // Gracefully map external status strings to our strict EntityStatus enum
  let mappedStatus: EntityStatus = "PENDING_CLIENT_INPUT";
  const externalStatus = payload.status.toUpperCase();
  if (externalStatus === "PUBLISHED") mappedStatus = "PUBLISHED";
  else if (externalStatus === "DRAFT") mappedStatus = "DRAFT";
  else if (externalStatus === "PLACEHOLDER") mappedStatus = "PLACEHOLDER";

  return {
    id: payload.id,
    slug: payload.slug,
    title: payload.title,
    content: payload.body_markdown,
    excerpt: payload.summary,
    authorName: payload.author?.name || "Autor Anónimo",
    publishedAt: payload.published_at ? new Date(payload.published_at) : null,
    status: mappedStatus,
    createdAt: new Date(payload.created_at),
    updatedAt: new Date(payload.updated_at),
  };
}
