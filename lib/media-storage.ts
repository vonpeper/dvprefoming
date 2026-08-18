import fs from "fs";
import path from "path";
import sharp from "sharp";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  mimeType: string;
  category: "uploads" | "brand" | "hero" | "teachers" | "programs" | "productions";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const MEDIA_FILE = path.join(DATA_DIR, "media.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "images", "uploads");

export function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStoredMediaItems(): MediaItem[] {
  ensureUploadsDir();
  let customUploads: MediaItem[] = [];

  if (fs.existsSync(MEDIA_FILE)) {
    try {
      const raw = fs.readFileSync(MEDIA_FILE, "utf-8");
      customUploads = JSON.parse(raw);
    } catch {
      customUploads = [];
    }
  }

  // Scan all system images in public/images to build a complete library like WordPress
  const publicImagesDir = path.join(process.cwd(), "public", "images");
  const systemItems: MediaItem[] = [];

  const folders: Array<"brand" | "hero" | "teachers" | "programs" | "productions"> = [
    "brand",
    "hero",
    "teachers",
    "programs",
    "productions",
  ];

  for (const folder of folders) {
    const folderPath = path.join(publicImagesDir, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.startsWith(".") || fs.statSync(path.join(folderPath, file)).isDirectory()) continue;
        const ext = path.extname(file).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
          const filePath = path.join(folderPath, file);
          const stat = fs.statSync(filePath);
          systemItems.push({
            id: `sys_${folder}_${file.replace(/[^a-z0-9]/gi, "_")}`,
            url: `/images/${folder}/${file}`,
            filename: file,
            originalName: file,
            sizeBytes: stat.size,
            mimeType: ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg",
            category: folder,
            createdAt: stat.birthtime.toISOString(),
          });
        }
      }
    }
  }

  // Combine custom uploads (first) and system images
  return [...customUploads, ...systemItems];
}

export function saveCustomUploads(items: MediaItem[]) {
  ensureUploadsDir();
  fs.writeFileSync(MEDIA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

/**
 * Optimizes an uploaded buffer (resizes max 1920x1920, converts to WebP with 85% quality)
 */
export async function processAndSaveImage(
  buffer: Buffer,
  originalFilename: string
): Promise<MediaItem> {
  ensureUploadsDir();

  const sanitizedBase = path
    .parse(originalFilename)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const timestamp = Date.now();
  const outputFilename = `${timestamp}-${sanitizedBase || "foto"}.webp`;
  const outputPath = path.join(UPLOADS_DIR, outputFilename);

  // Process and optimize with Sharp
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const optimizedBuffer = await image
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  fs.writeFileSync(outputPath, optimizedBuffer);

  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  const newItem: MediaItem = {
    id: `upl_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    url: `/images/uploads/${outputFilename}`,
    filename: outputFilename,
    originalName: originalFilename,
    sizeBytes: optimizedBuffer.length,
    width: optimizedMetadata.width,
    height: optimizedMetadata.height,
    mimeType: "image/webp",
    category: "uploads",
    createdAt: new Date().toISOString(),
  };

  const stored = getStoredMediaItems().filter((item) => item.category === "uploads");
  stored.unshift(newItem);
  saveCustomUploads(stored);

  return newItem;
}

export function deleteMediaItem(id: string): boolean {
  ensureUploadsDir();
  const stored = getStoredMediaItems().filter((item) => item.category === "uploads");
  const item = stored.find((i) => i.id === id);

  if (item) {
    const filePath = path.join(process.cwd(), "public", item.url.replace(/^\//, ""));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("[MEDIA DELETE FILE ERROR]", err);
      }
    }
    const filtered = stored.filter((i) => i.id !== id);
    saveCustomUploads(filtered);
    return true;
  }

  return false;
}
