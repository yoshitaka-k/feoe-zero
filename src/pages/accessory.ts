import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

import accessoryJson from "../../assets/data/accessory.json" with { type: "json" };

type Accessory = {
  name: string;
  power: string | number;
  target: string;
  effect: string;
  price: number;
};

const accessories = accessoryJson as unknown as Accessory[];

export async function handleAccessory(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/accessory.html"),
  );

  const accessoryHtml = accessories.map((accessory) => {
    const powerCell = accessory.power != null ? accessory.power : "";
    const effectCell = accessory.effect != null ? accessory.effect : "";
    const priceCell = accessory.price != null ? `${accessory.price.toLocaleString("ja-JP")}両` : "";

    return `<tr>
<td class="accessory-name no-wrap">${accessory.name}</td>
<td>${powerCell}</td>
<td>${accessory.target}</td>
<td>${effectCell}</td>
<td class="no-wrap">${priceCell}</td>
</tr>`;
  }).join("");

  return renderPage(`<table class="accessory-accessory">
<thead>
  <tr>
    <th>アクセサリー名</th>
    <th>威力</th>
    <th>対象</th>
    <th>効果</th>
    <th>価格</th>
  </tr>
</thead>
<tbody>
  ${body.replace("{{accessories}}", accessoryHtml)}
</tbody>
</table>`);
}
