/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task enemy-sheets:import
 *   deno task enemy-sheets:import -- --file ./scripts/tsv/enemy.tsv
 *
 * 出力先: assets/data/enemy.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/enemy.tsv");

type Country = {
  name: string;
  enemy: Array<Record<string, unknown>>;
};

function formatEnemyData(records: Record<string, unknown>[]): Country[] {
  const result: Country[] = [];
  const byCountry = new Map<string, Country>();
  let currentCountry = "";

  for (const row of records) {
    const country = pick(row, ["国", "country"]);

    if (country) currentCountry = String(country);

    const name = pick(row, ["名前", "name"]);
    if (!name || !currentCountry) {
      continue;
    }

    let node = byCountry.get(currentCountry);
    if (!node) {
      node = { name: currentCountry, enemy: [] };
      byCountry.set(currentCountry, node);
      result.push(node);
    }

    node.enemy.push({
      name: name,
      hp: pick(row, ["体", "hp"]),
      exp: pick(row, ["徳", "exp"]),
      money: pick(row, ["両", "money"]),
      special: pick(row, ["特殊攻撃", "special"]),
      drop: pick(row, ["落とすアイテム", "drop"]),
    });
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/enemy.tsv",
    sheetAliases: { spreadsheet: "enemy" },
    defaultFormatter: formatEnemyData,
    formatters: {
      enemy: formatEnemyData,
      spreadsheet: formatEnemyData,
    },
  }, Deno.args);
}
