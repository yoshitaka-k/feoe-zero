import { join } from "jsr:@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { specials } from "../data/special.ts";

export async function handleSpecial(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/special.html"),
  );

  let navHtml = specials.map((character) => {
    return `<li><a href="${withBase("/special")}#${character.character}">${character.character}</a></li>`;
  }).join("");
  navHtml = `<nav><ul>${navHtml}</ul></nav>`;

  const characterHtml = specials.map((character) => {
    const specialHtml = character.special.map((special) => {
      const point = special.point != null ? special.point : "--";

      return `<tr>
  <td>${special.name}</td>
  <td>${special.effect}</td>
  <td>${point}</td>
  <td>${special.note}</td>
</tr>`;
      }).join("");

    return `<div class="special-character">
<h4 id="${character.character}">${character.character}</h4>
<table class="special-table">
<thead>
  <tr>
    <th>奥義名</th>
    <th>効果</th>
    <th>消費</th>
    <th>条件</th>
  </tr>
</thead>
<tbody>${specialHtml}</tbody>
</table>
</div>`;
  }).join("");

  let html = body.replace("{{specials}}", characterHtml);
  html = html.replace("{{nav}}", navHtml);

  return renderPage(html);
}
