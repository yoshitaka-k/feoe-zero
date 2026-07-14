import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { items } from "../data/item.ts";

const rowSpanTdItem = "たい丹";
const rowsSpanTdItems = ["ち丹", "へん丹", "れん丹", "らく丹", "へい丹"];

export async function handleItem(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/item.html"),
  );

  const itemHtml = items.map((item) => {
    const effectCell = item.effect.replaceAll("、", "<br />");
    const priceCell = item.price != null ? `${item.price.toLocaleString("ja-JP")}両` : "--";
    const collCell = item.name == rowSpanTdItem ? "rowspan=6" : "";
    const tdEffectCell = rowsSpanTdItems.includes(item.name) ? `` : `<td ${collCell}>${effectCell}</td>`;

    return `<tr>
<td class="item-name no-wrap">${item.name}</td>
${tdEffectCell}
<td class="no-wrap">${priceCell}</td>
</tr>`;
  }).join("");

  const html = `<table class="item-item">
<thead>
  <tr>
    <th>商品名</th>
    <th>効果</th>
    <th>価格</th>
  </tr>
</thead>
<tbody>
  ${body.replace("{{items}}", itemHtml)}
</tbody>
</table>`;

  return renderPage(html);
}
