import { join } from "jsr:@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { bosses } from "../data/boss.ts";

export async function handleBoss(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/boss.html"),
  );

  let navHtml = bosses.map((country) => {
    return `<li><a href="${withBase("/boss")}#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav id="content-nav" class="content-nav"><ul>${navHtml}</ul></nav>`;

  const countryHtml = bosses.map((country) => {
    const bossHtml = country.boss.map((boss) => {
      const specialCell = boss.special != null ? boss.special.replaceAll(",", "<br />") : "--";

      return `<tr>
  <td>${boss.name}</td>
  <td>${boss.hp}</td>
  <td>${boss.exp}</td>
  <td>${boss.money}</td>
  <td>${specialCell}</td>
</tr>`;
      }).join("");

    return `<div class="boss-country">
<h4 id="${country.country}">${country.country}</h4>
<table class="boss-table">
<thead>
  <tr>
    <th>名前</th>
    <th>体</th>
    <th>徳</th>
    <th>両</th>
    <th>特殊技</th>
  </tr>
</thead>
<tbody>${bossHtml}</tbody>
</table>
</div>`;

  }).join("");

  let html = body.replace("{{boss}}", countryHtml);
  html = html.replace("{{nav}}", navHtml);

  return renderPage(html);
}
