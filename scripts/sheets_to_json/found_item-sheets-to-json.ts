/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task found_item-sheets:import
 *   deno task found_item-sheets:import -- --file ./scripts/tsv/found_item.tsv
 *
 * 出力先: assets/data/found_item.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/found_item.tsv");

type Country = {
  country: string;
  foundItem: Array<Record<string, unknown>>;
};

function formatFoundItemData(records: Record<string, unknown>[]): Country[] {
  const result: Country[] = [];
  const byCountry = new Map<string, Country>();
  let currentCountry = "";

  for (const row of records) {
    const country = pick(row, ["国", "country"]);

    if (country) currentCountry = String(country);

    const location = pick(row, ["場所", "location"]);
    if (!location || !currentCountry) {
      continue;
    }

    let node = byCountry.get(currentCountry);
    if (!node) {
      node = { country: currentCountry, foundItem: [] };
      byCountry.set(currentCountry, node);
      result.push(node);
    }

    node.foundItem.push({
      location: location,
      item: pick(row, ["入手アイテム", "item"]),
      note: pick(row, ["備考", "note"]),
    });
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/found_item.tsv",
    sheetAliases: { spreadsheet: "found_item" },
    defaultFormatter: formatFoundItemData,
    formatters: {
      found_item: formatFoundItemData,
      spreadsheet: formatFoundItemData,
    },
  }, Deno.args);
}
