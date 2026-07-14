import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { armors } from "../data/armor.ts";

const rowSpanTdArmor = "手あみのセーター";
const rowSpanTdArmors = ["手あみのぼうし", "手あみの手ぶくろ", "手あみのえりまき"];

export async function handleArmor(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/armor.html"),
  );

  const armorHtml = armors.map((armor) => {
    const powerCell = String(armor.power).replaceAll("、", "<br />");
    const effectCell = armor.effect != null ? armor.effect : "--";
    const priceCell = armor.price != null ? `${armor.price.toLocaleString("ja-JP")}両` : "--";

    const collCell = armor.name == rowSpanTdArmor ? "rowspan=4" : "";
    const tdPowerCell = rowSpanTdArmors.includes(armor.name) ? `` : `<td ${collCell}>${powerCell}</td>`;
    const tdEffectCell = rowSpanTdArmors.includes(armor.name) ? `` : `<td ${collCell}>${effectCell}</td>`;

    return `<tr>
<td class="armor-name no-wrap">${armor.name}</td>
${tdPowerCell}
<td>${armor.target}</td>
${tdEffectCell}
<td class="no-wrap">${priceCell}</td>
</tr>`;
  }).join("");

  return renderPage(`<table class="armor-armor">
<thead>
  <tr>
    <th>防具名</th>
    <th>威力</th>
    <th>対象</th>
    <th>効果</th>
    <th>価格</th>
  </tr>
</thead>
<tbody>
  ${body.replace("{{armors}}", armorHtml)}
</tbody>
</table>`);
}
