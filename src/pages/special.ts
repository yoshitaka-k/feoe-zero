import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

import specialJson from "../../assets/data/special.json" with { type: "json" };

type Special = {
  character: string;
  name: string;
  effect: string;
  magic_point: string;
  note: string;
};

type Character = {
  character: string;
  special: Special[];
};

const specials = specialJson as unknown as Character[];

export async function handleSpecial(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/special.html"),
  );

  let navHtml = specials.map((character) => {
    return `<li><a href="/special#${character.character}">${character.character}</a></li>`;
  }).join("");
  navHtml = `<nav><ul>${navHtml}</ul></nav>`;

  const characterHtml = specials.map((character) => {
    const specialHtml = character.special
      .map((special) => {
        const magicPoint = special.magic_point != null ? special.magic_point : "";

        return `<tr>
  <td class="special-name no-wrap">${special.name}</td>
  <td>${special.effect}</td>
  <td>${magicPoint}</td>
  <td>${special.note}</td>
</tr>`;
}).join("");

    return `<div class="special-character">
<h4 id="${character.character}">${character.character}</h4>
<table class="special-special">
<thead>
  <tr>
    <th>奥義名</th>
    <th>効果</th>
    <th>消費技</th>
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
