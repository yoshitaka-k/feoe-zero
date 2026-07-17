import { join } from "jsr:@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { enemies } from "../data/enemy.ts";

export async function handleEnemy(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/enemy.html"),
  );

  let navHtml = enemies.map((country) => {
    return `<li><a href="${withBase("/enemy")}#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav><ul>${navHtml}</ul></nav>`;

  const countryHtml = enemies.map((country) => {
    const enemyHtml = country.enemy.map((enemy) => {
      const specialCell = enemy.special != null ? enemy.special.replaceAll(",", "<br />") : "--";
      const dropCell = enemy.drop != null ? enemy.drop : "--";

      return `<tr>
  <td>${enemy.name}</td>
  <td>${enemy.hp}</td>
  <td>${enemy.exp}</td>
  <td>${enemy.money}</td>
  <td>${specialCell}</td>
  <td>${dropCell}</td>
</tr>`;
      }).join("");

    return `<div class="enemy-country">
<h4 id="${country.country}">${country.country}</h4>
<table class="enemy-table">
<thead>
  <tr>
    <th>名前</th>
    <th>体</th>
    <th>徳</th>
    <th>両</th>
    <th>特殊技</th>
    <th>落とすアイテム</th>
  </tr>
</thead>
<tbody>${enemyHtml}</tbody>
</table>
</div>`;

  }).join("");

  let html = body.replace("{{enemies}}", countryHtml);
  html = html.replace("{{nav}}", navHtml);

  return renderPage(html);
}
