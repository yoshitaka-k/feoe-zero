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
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/special.tsv");

type SpecialNode = {
  character: string;
  special: Array<Record<string, unknown>>;
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
      node = { character: currentCharacter, special: [] };
      byCharacter.set(currentCharacter, node);
      result.push(node);
    }

    node.special.push({
      name: productName,
      effect: pick(row, ["効果", "effect"]),
      point: pick(row, ["消費", "point"]),
      note: pick(row, ["条件", "note"]),
    });
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/special.tsv",
    sheetAliases: { spreadsheet: "special" },
    defaultFormatter: formatSpecialData,
    formatters: {
      special: formatSpecialData,
      spreadsheet: formatSpecialData,
    },
  }, Deno.args);
}
