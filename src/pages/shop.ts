import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

import shopsJson from "../../assets/data/shop.json" with { type: "json" };

type Product = {
  name: string;
  price: number;
};

type Shop = {
  shop: string;
  note: string;
  product: Product[];
};

type Location = {
  location: string;
  shop: Shop[];
};

type Country = {
  country: string;
  location: Location[];
};

const shops = shopsJson as unknown as Country[];

export async function handleShop(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/shop.html"),
  );

  let html = "";

  let navHtml = shops.map((country) => {
    return `<li><a href="/shop#${country.country}">${country.country}</a></li>`;
  }).join("");
  navHtml = `<nav><ul>${navHtml}</ul></nav>`;

  const shopHtml = shops.map((country) => {
    const locations = country.location.map((location) => {
      const shopBlocks = location.shop.map((shop) => {
        const products = shop.product
          .map((product) =>
            `<tr><td><span class="shop-product-name">${product.name}</span></td><td><span class="shop-product-price">${product.price}両</span></td></tr>`
          )
          .join("");

        return `<div class="shop-shop"><h4>${shop.shop}</h4><table class="shop-product"><thead><tr><th>商品名</th><th>価格</th></tr></thead><tbody>${products}</tbody></table></div>`;
      }).join("");

      return `<h3>${location.location}</h3>${shopBlocks}`;
    }).join("");

    return `<div class="shop-country"><h2 id="${country.country}">${country.country}</h2><div class="shop-location">${locations}</div></div>`;
  }).join("");

  html = body.replace("{{nav}}", navHtml);
  html = html.replace("{{shops}}", shopHtml);

  return renderPage(html);
}
