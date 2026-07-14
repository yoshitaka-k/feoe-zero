/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task hermit-sheets:import
 *   deno task hermit-sheets:import -- --file ./scripts/tsv/hermit.tsv
 *
 * 出力先: assets/data/hermit.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/hermit.tsv");

type HermitNode = {
  country: string;
  hermit: Array<Record<string, unknown>>;
};

type HermitJson = Array<HermitNode>;

function formatHermitData(records: Record<string, unknown>[]): HermitJson {
  const result: HermitJson = [];
  const byCountry = new Map<string, HermitNode>();
  let currentCountry = "";

  for (const row of records) {
    const country = pick(row, ["国", "country"]);

    if (country) currentCountry = String(country);

    const hermitName = pick(row, ["仙人", "name"]);
    if (!hermitName || !currentCountry) {
      continue;
    }

    let node = byCountry.get(currentCountry);
    if (!node) {
      node = { country: currentCountry, hermit: [] };
      byCountry.set(currentCountry, node);
      result.push(node);
    }

      node.hermit.push({
        name: hermitName,
        location: pick(row, ["場所", "location"]),
        scroll: pick(row, ["巻物", "scroll"]),
        special: pick(row, ["奥義", "special"]),
        note: pick(row, ["備考", "note"]),
      });
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/hermit.tsv",
    sheetAliases: { spreadsheet: "hermit" },
    defaultFormatter: formatHermitData,
    formatters: {
      hermit: formatHermitData,
      spreadsheet: formatHermitData,
    },
  }, Deno.args);
}
