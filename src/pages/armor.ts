import { join } from "jsr:@std/path";
import { renderPage } from "../common/layout.ts";
import { STATIC_DIR } from "../paths.ts";

export async function handleArmor(): Promise<Response> {
  const body = await Deno.readTextFile(
    join(STATIC_DIR, "pages/armor.html"),
  );
  return renderPage(body);
}
