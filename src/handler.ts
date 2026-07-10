import { ASSETS_DIR, STATIC_DIR } from "./paths.ts";
import { extname, join, normalize } from "jsr:@std/path";

// MIME Types
const MIME_TYPES: Record<string, string> = {
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

// 404 Not Found
function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

// アセットパスを解決
// - アセットパスが /assets/ から始まる場合、ASSETS_DIR からの相対パスを解決
// - アセットパスが /assets/ から始まらない場合、null を返す
// - アセットパスが .. を含む場合、null を返す
// - アセットパスが ASSETS_DIR からの相対パスでない場合、null を返す
function resolveAssetPath(pathname: string): string | null {
  if (!pathname.startsWith("/assets/")) {
    return null;
  }

  const relativePath = decodeURIComponent(pathname.slice("/assets/".length));
  if (!relativePath || relativePath.includes("..")) {
    return null;
  }

  const filePath = normalize(join(ASSETS_DIR, relativePath));
  const assetsRoot = normalize(ASSETS_DIR);
  if (filePath !== assetsRoot && !filePath.startsWith(`${assetsRoot}/`)) {
    return null;
  }

  return filePath;
}

// アセットをサーブ
async function serveAsset(pathname: string): Promise<Response> {
  const filePath = resolveAssetPath(pathname);
  if (!filePath) {
    return notFound();
  }

  try {
    const stat = await Deno.stat(filePath);
    if (!stat.isFile) {
      return notFound();
    }

    const content = await Deno.readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new Response(content, {
      headers: { "content-type": contentType },
    });

  } catch {
    return notFound();
  }
}

// ハンドラー
// - /api にアクセスした場合、JSON を返す
// - /assets/ にアクセスした場合、アセットをサーブ
// - それ以外の場合、index.html を返す
export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/assets/")) {
    return serveAsset(url.pathname);
  }

  // 共通ヘッダーとページのボディを読み込む
  const head = await Deno.readTextFile(
    new URL(join(STATIC_DIR, "partials/head.html"), import.meta.url),
  );

  const name = url.pathname === "/" ? "index" : url.pathname.slice(1);

  const page = join(STATIC_DIR, "pages", `${name}.html`);
  const body = await Deno.readTextFile(new URL(page, import.meta.url));

  const html = `<!DOCTYPE html>
<html lang="ja">
${head}
<body>
${body}
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
