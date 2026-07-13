import { join } from "jsr:@std/path";
import { STATIC_DIR } from "../paths.ts";

// body を head / header / footer で包んで HTML レスポンスを返す
export async function renderPage(body: string): Promise<Response> {
  const [head, header, footer] = await Promise.all([
    Deno.readTextFile(join(STATIC_DIR, "partials/head.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/header.html")),
    Deno.readTextFile(join(STATIC_DIR, "partials/footer.html")),
  ]);

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
${head}
</head>
<body>
${header}
${body}
${footer}
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
