import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

import shops from "../../assets/data/shop.json" with { type: "json" };

export async function handleShop(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/shop.html"),
  );

  let shopHtml = "";
  Object.values(shops).forEach((shop: any) => {
    shopHtml += `<div class="shop-country">`;
    shopHtml += `<h2>${shop.country}</h2>`;
    shopHtml += `<div class="shop-location">`;

    shop.location.forEach((location: any) => {
      shopHtml += `<h3>${location.location}</h3>`;

      location.shop.forEach((shop: any) => {
        shopHtml += `<div class="shop-shop">`;
        shopHtml += `<h4>${shop.shop}</h4>`;

        shopHtml += `<ul class="shop-product">`;

        shop.product.forEach((product: any) => {
          shopHtml += `<li><span class="shop-product-name">${product.name}</span><span class="shop-product-price">${product.price}両</span></li>`;
        });
        shopHtml += `</ul>`;
      });
        shopHtml += `</div>`;
    });
    shopHtml += `</div>`;
  });

  const html = body.replace("{{shops}}", shopHtml);

  return renderPage(html);
}
