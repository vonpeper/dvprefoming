import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * API Route Webhook for Manifiesto 21 Blog Engine revalidation.
 * Automatically clears Next.js fetch cache on-demand when articles are published or updated.
 * 
 * Secure validation using MANIFIESTO21_WEBHOOK_SECRET query parameter or header.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.MANIFIESTO21_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[REVALIDATE] Webhook secret not configured in env variables.");
    return NextResponse.json(
      { error: "Revalidation webhook secret is not configured on host" },
      { status: 500 }
    );
  }

  // Check search parameter or header X-M21-Webhook-Secret for match
  const searchParams = req.nextUrl.searchParams;
  const urlToken = searchParams.get("secret");
  const headerToken = req.headers.get("x-m21-webhook-secret");

  if (urlToken !== secret && headerToken !== secret) {
    console.warn("[REVALIDATE] Unauthorized webhook attempt detected.");
    return NextResponse.json(
      { error: "Invalid revalidation webhook signature or token" },
      { status: 401 }
    );
  }

  try {
    // Purge next.js cache for editorial tag
    revalidateTag("editorial", { expire: 0 });
    console.log("[REVALIDATE] Successfully purged next.js fetch cache for 'editorial' tag.");

    return NextResponse.json(
      { revalidated: true, tag: "editorial", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("[REVALIDATE] Cache revalidation failed:", error);
    return NextResponse.json(
      { error: "Cache revalidation process encountered an error" },
      { status: 500 }
    );
  }
}
