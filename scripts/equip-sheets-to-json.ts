/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task equip-sheets:import
 *   deno task equip-sheets:import -- --file ./scripts/tsv/wepon.tsv
 *
 * 出力先: assets/data/wepon.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "./lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "tsv/wepon.tsv");

type WeponJson = Array<Record<string, unknown>>;

function formatWeponData(records: Record<string, unknown>[]): WeponJson {
  const result: WeponJson = [];

  for (const row of records) {
    const productName = pick(row, ["名前", "name", "商品名"]);
    if (!productName) {
      continue;
    }

    const product: Record<string, unknown> = {
      名前: productName,
      威力: pick(row, ["威力", "power"]),
      対象: pick(row, ["対象", "target"]),
      効果: pick(row, ["効果", "effect"]),
      値段: pick(row, ["値段", "price"]),
    };

    result.push(product);
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/wepon.tsv",
    sheetAliases: { spreadsheet: "wepon" },
    formatters: {
      wepon: formatWeponData,
      spreadsheet: formatWeponData,
    },
  }, Deno.args);
}
