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
  return renderPage(body);
}
