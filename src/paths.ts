import { join } from "jsr:@std/path";

// paths.ts が src/ にある想定
export const PROJECT_ROOT = join(import.meta.dirname!, "..");
export const STATIC_DIR = join(PROJECT_ROOT, "static");
export const ASSETS_DIR = join(PROJECT_ROOT, "assets");
export const ASSETS_DATA_DIR = join(ASSETS_DIR, "data");
