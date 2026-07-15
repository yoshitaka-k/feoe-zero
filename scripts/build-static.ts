import { copy, emptyDir } from "jsr:@std/fs";
import { join } from "jsr:@std/path";
import { handler } from "../src/handler.ts";
import { ASSETS_DIR, PROJECT_ROOT } from "../src/paths.ts";

const DIST_DIR = join(PROJECT_ROOT, "dist");

/** handler と揃えた静的書き出しルート */
const ROUTES = [
  "/",
  "/shop",
  "/item",
  "/scroll",
  "/special",
  "/hermit",
  "/wepon",
  "/armor",
  "/accessory",
  "/enemy",
] as const;

function distPathForRoute(pathname: string): string {
  if (pathname === "/") {
    return join(DIST_DIR, "index.html");
  }
  return join(DIST_DIR, pathname.slice(1), "index.html");
}

async function writeRoute(pathname: string): Promise<void> {
  const res = await handler(new Request(`http://localhost${pathname}`));
  if (!res.ok) {
    throw new Error(`Failed to render ${pathname}: ${res.status}`);
  }

  const html = await res.text();
  const outPath = distPathForRoute(pathname);
  await Deno.mkdir(join(outPath, ".."), { recursive: true });
  await Deno.writeTextFile(outPath, html);
  console.log(`wrote ${outPath}`);
}

async function copyAssets(): Promise<void> {
  const dest = join(DIST_DIR, "assets");
  await copy(ASSETS_DIR, dest, { overwrite: true });
  console.log(`copied assets -> ${dest}`);
}

if (import.meta.main) {
  await emptyDir(DIST_DIR);
  for (const route of ROUTES) {
    await writeRoute(route);
  }
  await copyAssets();
  console.log("static build complete");
}
