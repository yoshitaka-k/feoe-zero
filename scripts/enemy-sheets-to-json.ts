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

const DEFAULT_FILE = join(import.meta.dirname!, "tsv/enemy.tsv");

type EnemyNode = {
  name: string;
  hp: number;
  mp: number;
  exp: number;
  money: number;
  special: string;
  drop: string;
};

type Country = {
  name: string;
  enemy: EnemyNode[];
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
      name: String(name),
      hp: Number(pick(row, ["体", "hp"])),
      mp: Number(pick(row, ["技", "mp"])),
      exp: Number(pick(row, ["徳", "exp"])),
      money: Number(pick(row, ["両", "money"])),
      special: String(pick(row, ["特殊攻撃", "special"])),
      drop: String(pick(row, ["落とすアイテム", "drop"])),
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
