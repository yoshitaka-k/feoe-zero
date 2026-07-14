import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

import scrollJson from "../../assets/data/scroll.json" with { type: "json" };

type Scroll = {
  name: string;
  effect: string;
  magic_point: number;
  target: string;
  location: string;
};

const scrolls = scrollJson as unknown as Scroll[];

export async function handleScroll(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/scroll.html"),
  );

  const scrollHtml = scrolls.map((scroll) => {
    return `<tr>
<td class="scroll-name no-wrap">${scroll.name}</td>
<td>${scroll.effect}</td>
<td>${scroll.magic_point}</td>
<td>${scroll.target}</td>
<td>${scroll.location}</td>
</tr>`;
  }).join("");

  return renderPage(`<table class="scroll-scroll">
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
