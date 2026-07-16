/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task boss-sheets:import
 *   deno task boss-sheets:import -- --file ./scripts/tsv/boss.tsv
 *
 * 出力先: assets/data/boss.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/boss.tsv");

type Country = {
  name: string;
  boss: Array<Record<string, unknown>>;
};

function formatBossData(records: Record<string, unknown>[]): Country[] {
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
      node = { name: currentCountry, boss: [] };
      byCountry.set(currentCountry, node);
      result.push(node);
    }

    node.boss.push({
      name: name,
      hp: pick(row, ["体", "hp"]),
      exp: pick(row, ["徳", "exp"]),
      money: pick(row, ["両", "money"]),
      special: pick(row, ["特殊攻撃", "special"]),
    });
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/boss.tsv",
    sheetAliases: { spreadsheet: "boss" },
    defaultFormatter: formatBossData,
    formatters: {
      boss: formatBossData,
      spreadsheet: formatBossData,
    },
  }, Deno.args);
}
