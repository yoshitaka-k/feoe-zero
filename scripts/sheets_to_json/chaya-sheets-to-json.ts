/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task chaya-sheets:import
 *   deno task chaya-sheets:import -- --file ./scripts/tsv/chaya.tsv
 *
 * 出力先: assets/data/chaya.json のように 1 シート = 1 ファイル
 */

import { join } from "@std/path";
import { pick, runSheetImport } from "../lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "../tsv/chaya.tsv");

type CountryNode = {
  country: string;
  location: Array<Record<string, unknown>>;
}

type CityNode = {
  location: string;
  chaya: Array<Record<string, unknown>>;
};

type ChayaJson = Array<CountryNode>;

function formatChayaData(records: Record<string, unknown>[]): ChayaJson {
  const result: ChayaJson = [];
  const byCountry = new Map<string, CountryNode>();
  const byCity = new Map<string, CityNode>();
  let currentCountry = "";
  let currentCity = "";

  for (const row of records) {
    const country = pick(row, ["国", "country"]);
    const city = pick(row, ["場所", "location"]);

    if (country) currentCountry = String(country);
    if (city) currentCity = String(city);

    const name = pick(row, ["名前", "name"]);
    if (!name || !currentCountry || !currentCity) {
      continue;
    }

    let countryNode = byCountry.get(currentCountry);
    if (!countryNode) {
      countryNode = { country: currentCountry, location: [] };
      byCountry.set(currentCountry, countryNode);
      result.push(countryNode);
    }

    let cityNode = byCity.get(currentCity);
    if (!cityNode) {
      cityNode = { location: currentCity, chaya: [] };
      byCity.set(currentCity, cityNode);
      countryNode.location.push(cityNode);
    }

    cityNode.chaya.push({
      room: pick(row, ["部屋", "room"]),
      name: name,
      event: pick(row, ["イベント", "event"]),
      note: pick(row, ["備考", "note"]),
    });
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/chaya.tsv",
    sheetAliases: { spreadsheet: "chaya" },
    defaultFormatter: formatChayaData,
    formatters: {
      chaya: formatChayaData,
      spreadsheet: formatChayaData,
    },
  }, Deno.args);
}
