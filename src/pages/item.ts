import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

import itemsJson from "../../assets/data/item.json" with { type: "json" };

type Item = {
  name: string;
  effect: string;
  price: number;
};

const items = itemsJson as unknown as Item[];

export async function handleItem(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/item.html"),
  );

  const itemHtml = items.map((item) => {
    const effectCell = item.effect.replaceAll("、", "<br />");
    const priceCell = item.price != null ? `${item.price.toLocaleString("ja-JP")}両` : "";

    return `<tr><td>${item.name}</td><td>${effectCell}</td><td>${priceCell}</td></tr>`;
  }).join("");

  const html = `<table class="item-item">
<thead><tr><th>商品名</th><th>効果</th><th>価格</th></tr></thead>
<tbody>
${body.replace("{{items}}", itemHtml)}</tbody></table>`;

  return renderPage(html);
}
