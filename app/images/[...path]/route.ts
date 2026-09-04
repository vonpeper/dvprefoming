import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Sanitize path to prevent directory traversal
    const safePath = pathSegments
      .map((seg) => seg.replace(/[^a-zA-Z0-9._-]/g, ""))
      .filter(Boolean)
      .join(path.sep);

    const filePath = path.join(process.cwd(), "public", "images", safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const fileBuffer = fs.readFileSync(filePath);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    }

    // If specific file not found, check if a default placeholder exists
    const defaultFallback = path.join(process.cwd(), "public", "images", "productions", "si-no-es-ahora.jpg");
    if (fs.existsSync(defaultFallback)) {
      const fallbackBuffer = fs.readFileSync(defaultFallback);
      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return new NextResponse("Image Not Found", { status: 404 });
  } catch (error) {
    console.error("[DYNAMIC IMAGE ROUTE ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
