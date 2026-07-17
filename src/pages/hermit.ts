import { join } from "jsr:@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { hermits } from "../data/hermit.ts";

export async function handleHermit(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/hermit.html"),
  );

  let navHtml = hermits.map((country) => {
    return `<li><a href="${withBase("/hermit")}#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav class="content-nav"><ul>${navHtml}</ul></nav>`;

  const countryHtml = hermits.map((country) => {
    const hermitHtml = country.hermit.map((hermit) => {
      const scroll = hermit.scroll != null ? hermit.scroll : "--";
      const special = hermit.special != null ? hermit.special : "--";
      const note = hermit.note != null ? hermit.note.replaceAll(",", "<br />") : "--";

      return `<tr>
  <td>${hermit.name}</td>
  <td>${hermit.location}</td>
  <td>${scroll}</td>
  <td>${special}</td>
  <td>${note}</td>
</tr>`;
}).join("");

    return `<h4 id="${country.country}">${country.country}</h4>
<table class="hermit-table">
<thead>
  <tr>
    <th>仙人</th>
    <th>場所</th>
    <th>巻物</th>
    <th>奥義</th>
  <th>備考</th>
  </tr>
</thead>
<tbody>${hermitHtml}</tbody>
</table>
</h4>`;
  }).join("");

  let html = body.replace("{{nav}}", navHtml);
  html = html.replace("{{hermits}}", countryHtml);

  return renderPage(html);
}
