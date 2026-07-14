import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { wepons } from "../data/wepon.ts";

export async function handleWepon(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/wepon.html"),
  );

  const weponHtml = wepons.map((wepon) => {
    const effectCell = wepon.effect != null ? wepon.effect : "--";
    const priceCell = wepon.price != null ? `${wepon.price.toLocaleString("ja-JP")}両` : "--";

    return `<tr>
<td class="wepon-name no-wrap">${wepon.name}</td>
<td>${wepon.power}</td>
<td>${wepon.target}</td>
<td>${effectCell}</td>
<td class="no-wrap">${priceCell}</td>
</tr>`;
  }).join("");

  return renderPage(`<table class="wepon-wepon">
<thead>
  <tr>
    <th>武器名</th>
    <th>威力</th>
    <th>対象</th>
    <th>効果</th>
    <th>価格</th>
  </tr>
</thead>
<tbody>
  ${body.replace("{{wepons}}", weponHtml)}
</tbody>
</table>`);
}
