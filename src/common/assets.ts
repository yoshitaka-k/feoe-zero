import { extname, join, normalize } from "@std/path";
import { ASSETS_DIR, MIME_TYPES } from "../paths.ts";
import { notFound } from "./not_found.ts";

// アセットパスを解決
// - /assets/ から始まる場合、ASSETS_DIR からの相対パスを解決
// - それ以外・.. を含む・ルート外なら null
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

// /assets/ 配下のファイルをサーブ
export async function serveAsset(pathname: string): Promise<Response> {
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
