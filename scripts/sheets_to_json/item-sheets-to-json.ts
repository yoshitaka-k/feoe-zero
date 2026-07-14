/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task item-sheets:import
 *   deno task item-sheets:import -- --file ./scripts/tsv/item.tsv
 *
 * 出力先: assets/data/item.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/item.tsv");

type ItemJson = Array<Record<string, unknown>>;

function formatItemData(records: Record<string, unknown>[]): ItemJson {
  const result: ItemJson = [];

  for (const row of records) {
    const productName = pick(row, ["名前", "name", "商品名"]);
    if (!productName) {
      continue;
    }

    const product: Record<string, unknown> = {
      name: productName,
      effect: pick(row, ["効果", "effect"]),
      price: pick(row, ["値段", "price"]),
    };

    result.push(product);
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/item.tsv",
    sheetAliases: { spreadsheet: "item" },
    defaultFormatter: formatItemData,
    formatters: {
      item: formatItemData,
      spreadsheet: formatItemData,
    },
  }, Deno.args);
}
