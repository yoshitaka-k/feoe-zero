/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task special-sheets:import
 *   deno task special-sheets:import -- --file ./scripts/tsv/special.tsv
 *
 * 出力先: assets/data/special.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "./lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "tsv/special.tsv");

type SpecialNode = {
  キャラクター: string;
  奥義: Array<Record<string, unknown>>;
};

type SpecialJson = Array<SpecialNode>;

function formatSpecialData(records: Record<string, unknown>[]): SpecialJson {
  const result: SpecialJson = [];
  const byCharacter = new Map<string, SpecialNode>();
  let currentCharacter = "";

  for (const row of records) {
    const character = pick(row, ["キャラクター", "character"]);

    if (character) currentCharacter = String(character);

    const productName = pick(row, ["名前", "name", "奥義名"]);
    if (!productName || !currentCharacter) {
      continue;
    }

    let node = byCharacter.get(currentCharacter);
    if (!node) {
      node = { キャラクター: currentCharacter, 奥義: [] };
      byCharacter.set(currentCharacter, node);
      result.push(node);
    }

    node.奥義.push({
      名前: productName,
      効果: pick(row, ["効果", "effect"]),
      消費: pick(row, ["消費", "consumption"]),
      条件: pick(row, ["条件", "condition"]),
    });
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
