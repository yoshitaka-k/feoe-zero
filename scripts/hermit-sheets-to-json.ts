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
import { pick, runSheetImport } from "./lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "tsv/hermit.tsv");

type HermitNode = {
  仙人: Array<Record<string, unknown>>;
};

type HermitJson = Record<string, HermitNode>;

function formatHermitData(records: Record<string, unknown>[]): HermitJson {
  const result: HermitJson = {};
  let currentCountory = "";

  for (const row of records) {
    const countory = pick(row, ["国", "country"]);

    if (countory) currentCountory = String(countory);

    const hermitName = pick(row, ["仙人", "hermit"]);
    if (!hermitName || !currentCountory) {
      continue;
    }

    result[currentCountory] ??= {
      仙人: [],
    };

    const hermit: Record<string, unknown> = {
      仙人: hermitName,
      場所: pick(row, ["場所", "location"]),
      巻物: pick(row, ["巻物", "scroll"]),
      奥義: pick(row, ["奥義", "special"]),
      備考: pick(row, ["備考", "note"]),
    };

    result[currentCountory].仙人.push(hermit);
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/hermit.tsv",
    sheetAliases: { spreadsheet: "hermit" },
    formatters: {
      hermit: formatHermitData,
      spreadsheet: formatHermitData,
    },
  }, Deno.args);
}
