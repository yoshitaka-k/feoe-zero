import { join } from "jsr:@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { foundItems } from "../data/found_item.ts";

export async function handleFoundItem(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/found_item.html"),
  );

  let navHtml = foundItems.map((country) => {
    return `<li><a href="${withBase("/found_item")}#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav id="content-nav" class="content-nav"><ul>${navHtml}</ul></nav>`;

  const countryHtml = foundItems.map((country) => {
    const foundItemHtml = country.foundItem.map((foundItem) => {
      const itemsCell = foundItem.item != null ? foundItem.item.replaceAll(",", "<br />") : "--";
      const noteCell = foundItem.note != null ? foundItem.note : "--";

      return `<tr>
  <td>${foundItem.location}</td>
  <td>${itemsCell}</td>
  <td>${noteCell}</td>
</tr>`;
      }).join("");

    return `<div class="found_item-country">
<h4 id="${country.country}">${country.country}</h4>
<table class="found_item-table">
<thead>
  <tr>
    <th>場所</th>
    <th>入手アイテム</th>
    <th>備考</th>
  </tr>
</thead>
<tbody>${foundItemHtml}</tbody>
</table>
</div>`;

  }).join("");

  let html = body.replace("{{found_items}}", countryHtml);
  html = html.replace("{{nav}}", navHtml);

  return renderPage(html, "Found Item");
}
