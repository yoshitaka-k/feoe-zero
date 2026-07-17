import { join } from "@std/path";

// サイトタイトル
export const SITE_TITLE = "Far East of Eden Zero";

// paths.ts が src/ にある想定
export const PROJECT_ROOT = join(import.meta.dirname!, "..");
export const STATIC_DIR = join(PROJECT_ROOT, "static");
export const ASSETS_DIR = join(PROJECT_ROOT, "assets");
export const ASSETS_DATA_DIR = join(ASSETS_DIR, "data");

// MIME Types
export const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
