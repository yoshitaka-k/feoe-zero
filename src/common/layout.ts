import { join } from "jsr:@std/path";
import { applyBasePath, withBase } from "./base_path.ts";
import { STATIC_DIR } from "../paths.ts";

// body を head / header / footer で包んで HTML レスポンスを返す
export async function renderPage(body: string): Promise<Response> {
  const [head, gtag, header, footer] = await Promise.all([
    Deno.readTextFile(join(STATIC_DIR, "partials/head.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/gtag.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/header.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/footer.html")),
  ]);

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
${applyBasePath(head)}
</head>
<body>
${applyBasePath(gtag)}
<div class="container">
  ${applyBasePath(header)}
  <main id="page-content">
    ${body}
  </main>
  ${applyBasePath(footer)}
  <script src="${withBase("/assets/js/script.js")}"></script>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
