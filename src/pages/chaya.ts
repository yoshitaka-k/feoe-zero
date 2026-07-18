import { join } from "@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { chayas } from "../data/chaya.ts";

export async function handleChaya(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/chaya.html"),
  );

  let navHtml = chayas.map((country) => {
    return `<li><a href="${withBase("/chaya")}#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav id="content-nav" class="content-nav"><ul>${navHtml}</ul></nav>`;

  const countryHtml = chayas.map((country) => {
    const locations = country.location.map((location) => {
      const chayaHtml = location.chaya.map((chaya, index) => {
        const locationCell = index === 0 && location.chaya.length > 1 ? `<td rowspan=${location.chaya.length}>${location.location}</td>` : "";
        const noteCell = chaya.note != null ? chaya.note.replaceAll(",", "<br />") : "--";

        return `<tr>
          ${locationCell}
          <td>${chaya.room}</td>
          <td>${chaya.name}</td>
          <td>${chaya.event}</td>
          <td>${noteCell}</td>
        </tr>`;
      }).join("");

      return `<div class="chaya-location">
<table class="chaya-table">
<thead>
  <tr>
    <th>場所</th>
    <th>部屋</th>
    <th>名前</th>
    <th>イベント</th>
    <th>備考</th>
  </tr>
</thead>
<tbody>${chayaHtml}</tbody>
</table>
</div>`;
    }).join("");

    return `<h3 id="${country.country}">${country.country}</h3>${locations}`;
  }).join("");

  let html = body.replace("{{nav}}", navHtml);
  html = html.replace("{{chaya}}", countryHtml);

  return renderPage(html, "Chaya");
}
