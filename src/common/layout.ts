import { join } from "jsr:@std/path";
import { applyBasePath, withBase } from "./base_path.ts";
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
${applyBasePath(head)}
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-WFR8C7XMQ9');
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P2Q83FT7');
</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P2Q83FT7" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${applyBasePath(header)}
<main id="page-content">
${body}
</main>
${applyBasePath(footer)}
<script src="${withBase("/assets/js/script.js")}"></script>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
