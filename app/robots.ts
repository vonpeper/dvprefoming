import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isIndexingEnabled = process.env.SITE_INDEXING_ENABLED === "true";

  if (!isIndexingEnabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
