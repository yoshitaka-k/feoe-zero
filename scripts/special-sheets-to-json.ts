/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task shop-sheets:import
 *   deno task shop-sheets:import -- --file ./scripts/tsv/special.tsv
 *
 * 出力先: assets/data/shop.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "./lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "tsv/special.tsv");

type SpecialNode = {
  奥義: Array<Record<string, unknown>>;
};

type SpecialJson = Record<string, SpecialNode>;

function formatSpecialData(records: Record<string, unknown>[]): SpecialJson {
  const result: SpecialJson = {};
  let currentCharacter = "";

  for (const row of records) {
    const character = pick(row, ["キャラクター", "character"]);

    if (character) currentCharacter = String(character);

    const productName = pick(row, ["名前", "name", "商品名"]);
    if (!productName || !currentCharacter) {
      continue;
    }

    result[currentCharacter] ??= {
      奥義: [],
    };

    const product: Record<string, unknown> = {
      名前: productName,
      効果: pick(row, ["効果", "effect"]),
      消費: pick(row, ["消費", "consumption"]),
      条件: pick(row, ["条件", "condition"]),
    };

    result[currentCharacter].奥義.push(product);
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/special.tsv",
    sheetAliases: { spreadsheet: "special" },
    formatters: {
      special: formatSpecialData,
      spreadsheet: formatSpecialData,
    },
  }, Deno.args);
}
