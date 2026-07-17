/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task scroll-sheets:import
 *   deno task scroll-sheets:import -- --file ./scripts/tsv/scroll.tsv
 *
 * 出力先: assets/data/scroll.json のように 1 シート = 1 ファイル
 */

import { join } from "@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/scroll.tsv");

type ScrollJson = Array<Record<string, unknown>>;

function formatScrollData(records: Record<string, unknown>[]): ScrollJson {
  const result: ScrollJson = [];

  for (const row of records) {
    const productName = pick(row, ["巻物", "name", "巻物名"]);
    if (!productName) {
      continue;
    }

    const product: Record<string, unknown> = {
      name: productName,
      effect: pick(row, ["効果", "effect"]),
      magic_point: pick(row, ["消費技", "magic_point"]),
      target: pick(row, ["対象", "target"]),
      location: pick(row, ["入手", "location"]),
    };

    result.push(product);
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/scroll.tsv",
    sheetAliases: { spreadsheet: "scroll" },
    defaultFormatter: formatScrollData,
    formatters: {
      scroll: formatScrollData,
      spreadsheet: formatScrollData,
    },
  }, Deno.args);
}
