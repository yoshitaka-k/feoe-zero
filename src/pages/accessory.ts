import { join } from "@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { accessories } from "../data/accessory.ts";

export async function handleAccessory(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/accessory.html"),
  );

  const accessoryHtml = accessories.map((accessory) => {
    const powerCell = accessory.power != null ? accessory.power : "--";
    const targetCell = accessory.target.replaceAll(",", "、");
    const effectCell = accessory.effect != null ? accessory.effect : "--";
    const priceCell = accessory.price != null ? `${accessory.price.toLocaleString("ja-JP")}両` : "--";
    const noteCell = accessory.note ? accessory.note : "--";

    return `<tr>
  <td>${accessory.name}</td>
  <td>${powerCell}</td>
  <td>${targetCell}</td>
  <td>${effectCell}</td>
  <td class="price">${priceCell}</td>
  <td>${noteCell}</td>
</tr>`;
  }).join("");

  const html = `<table class="accessory-table">
<thead>
  <tr>
    <th>アクセサリー名</th>
    <th>威力</th>
    <th>対象</th>
    <th>効果</th>
    <th>価格</th>
    <th>備考</th>
  </tr>
</thead>
<tbody>
  ${body.replace("{{accessories}}", accessoryHtml)}
</tbody>
</table>`;

  return renderPage(html, "Accessory");
}
