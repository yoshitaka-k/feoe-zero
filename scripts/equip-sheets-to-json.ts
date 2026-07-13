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

type EquipJson = Array<Record<string, unknown>>;

function formatEquipData(records: Record<string, unknown>[]): EquipJson {
  const result: EquipJson = [];

  for (const row of records) {
    const productName = pick(row, ["名前", "name", "商品名"]);
    if (!productName) {
      continue;
    }

    const product: Record<string, unknown> = {
      name: productName,
      power: pick(row, ["威力", "power"]),
      target: pick(row, ["対象", "target"]),
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
    helpDefaultFile: "scripts/tsv/wepon.tsv",
    sheetAliases: { spreadsheet: "wepon" },
    // wepon / armor / accessory など、ファイル名が変わっても同一スキーマへ変換する
    defaultFormatter: formatEquipData,
    formatters: {
      wepon: formatEquipData,
      armor: formatEquipData,
      accessory: formatEquipData,
      spreadsheet: formatEquipData,
    },
  }, Deno.args);
}
