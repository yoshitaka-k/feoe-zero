import { join } from "jsr:@std/path";
import { applyBasePath, withBase } from "./base_path.ts";
import { STATIC_DIR, SITE_TITLE } from "../paths.ts";

// body を head / header / footer で包んで HTML レスポンスを返す
export async function renderPage(body: string, title: string): Promise<Response> {
  const [head, gtag, header, footer] = await Promise.all([
    Deno.readTextFile(join(STATIC_DIR, "partials/head.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/gtag.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/header.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/footer.html")),
  ]);

  title = title ? `${SITE_TITLE} - ${title}` : SITE_TITLE;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  ${applyBasePath(head.replace("{{title}}", title))}
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
