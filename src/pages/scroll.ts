import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";
import { scrolls } from "../data/scroll.ts";

export async function handleScroll(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/scroll.html"),
  );

  const scrollHtml = scrolls.map((scroll) => {
    const targetCell = scroll.target.replaceAll(",", "、");

    return `<tr>
  <td class="no-wrap">${scroll.name}</td>
  <td>${scroll.effect}</td>
  <td>${scroll.magic_point}</td>
  <td>${targetCell}</td>
  <td>${scroll.location}</td>
</tr>`;
  }).join("");

  return renderPage(`<table class="scroll-table">
<thead>
  <tr>
    <th>巻物</th>
    <th>効果</th>
    <th>消費技</th>
    <th>対象</th>
    <th>場所</th>
  </tr>
</thead>
<tbody>
  ${body.replace("{{scrolls}}", scrollHtml)}
</tbody>
</table>`);
}
