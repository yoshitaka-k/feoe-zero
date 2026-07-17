import { join } from "jsr:@std/path";
import { withBase } from "../common/base_path.ts";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { shops } from "../data/shop.ts";

export async function handleShop(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/shop.html"),
  );

  let navHtml = shops.map((country) => {
    return `<li><a href="${withBase("/shop")}#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav class="content-nav"><ul>${navHtml}</ul></nav>`;

  const shopHtml = shops.map((country) => {
    const locations = country.location.map((location) => {
      const shopBlocks = location.shop.map((shop) => {
        const products = shop.product.map((product, index) => {
          const shopNameCell = index === 0 && shop.product.length > 1 ? `<td rowspan=${shop.product.length}>${shop.shop}</td>` : "";

          return `<tr>
  ${shopNameCell}
  <td>${product.name}</td>
  <td class="price">${product.price}両</td>
</tr>`;
          }).join("");

        return `<div class="shop-shop">
<table class="shop-table">
<thead>
  <tr>
    <th>店名</th>
    <th>商品名</th>
    <th>価格</th>
    </tr>
  </thead>
<tbody>${products}</tbody>
</table>
</div>`;
      }).join("");

      return `<h3>${location.location}</h3>${shopBlocks}`;
    }).join("");

    return `<div class="shop-country">
<h2 id="${country.country}">${country.country}</h2>
<div class="shop-location">${locations}</div>
</div>`;
  }).join("");

  let html = body.replace("{{nav}}", navHtml);
  html = html.replace("{{shops}}", shopHtml);

  return renderPage(html);
}
